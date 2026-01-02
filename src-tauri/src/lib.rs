use base64::{engine::general_purpose::STANDARD, Engine};
use serde::{Deserialize, Serialize};
use std::path::Path;
use std::process::Command;
use tauri::Manager;

/// Represents a changed file in the git repository
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ChangedFile {
    pub path: String,
    pub filename: String,
    pub status: String, // "modified", "added", or "deleted"
}

/// Represents information about a git commit
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct CommitInfo {
    pub hash: String,
    pub short_hash: String,
    pub message: String,
    pub author: String,
    pub date: String,
}

/// Image file extensions we care about
const IMAGE_EXTENSIONS: &[&str] = &["png", "jpg", "jpeg", "gif", "svg", "webp", "bmp", "ico"];

/// Check if a file path has an image extension
fn is_image_file(path: &str) -> bool {
    let path_lower = path.to_lowercase();
    IMAGE_EXTENSIONS.iter().any(|ext| path_lower.ends_with(&format!(".{}", ext)))
}

/// Core logic: Validates if the given path is a git repository
pub fn validate_git_repo_impl(path: &str) -> Result<bool, String> {
    let path = Path::new(path);

    if !path.exists() {
        return Err(format!("Path does not exist: {}", path.display()));
    }

    // Check if .git directory exists
    let git_dir = path.join(".git");
    Ok(git_dir.exists() && git_dir.is_dir())
}

/// Core logic: Gets the list of changed image files in the repository
pub fn get_changed_files_impl(repo_path: &str) -> Result<Vec<ChangedFile>, String> {
    let path = Path::new(repo_path);

    if !path.exists() {
        return Err(format!("Repository path does not exist: {}", repo_path));
    }

    // Run git status --porcelain to get changed files
    let output = Command::new("git")
        .args(["status", "--porcelain"])
        .current_dir(path)
        .output()
        .map_err(|e| format!("Failed to run git status: {}", e))?;

    if !output.status.success() {
        return Err(format!(
            "git status failed: {}",
            String::from_utf8_lossy(&output.stderr)
        ));
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    let mut files = Vec::new();

    for line in stdout.lines() {
        if line.len() < 3 {
            continue;
        }

        let status_code = &line[0..2];
        let file_path = line[3..].trim();

        // Skip non-image files
        if !is_image_file(file_path) {
            continue;
        }

        // Parse status
        let status = match status_code.trim() {
            "M" | " M" | "MM" => "modified",
            "A" | " A" | "AM" => "added",
            "D" | " D" => "deleted",
            "??" => "added", // Untracked files are new
            "R" | " R" => "modified", // Renamed counts as modified
            _ => continue, // Skip other statuses
        };

        // Extract filename from path
        let filename = Path::new(file_path)
            .file_name()
            .map(|n| n.to_string_lossy().to_string())
            .unwrap_or_else(|| file_path.to_string());

        files.push(ChangedFile {
            path: file_path.to_string(),
            filename,
            status: status.to_string(),
        });
    }

    Ok(files)
}

/// Core logic: Gets the base64-encoded content of a file at HEAD
pub fn get_file_at_head_impl(repo_path: &str, file_path: &str) -> Result<String, String> {
    let path = Path::new(repo_path);

    if !path.exists() {
        return Err(format!("Repository path does not exist: {}", repo_path));
    }

    // Run git show HEAD:file_path
    let output = Command::new("git")
        .args(["show", &format!("HEAD:{}", file_path)])
        .current_dir(path)
        .output()
        .map_err(|e| format!("Failed to run git show: {}", e))?;

    if !output.status.success() {
        return Err(format!(
            "File does not exist at HEAD: {}",
            String::from_utf8_lossy(&output.stderr)
        ));
    }

    // Encode the binary content as base64
    Ok(STANDARD.encode(&output.stdout))
}

/// Core logic: Gets the list of commits in the repository
pub fn get_commits_impl(repo_path: &str, limit: u32) -> Result<Vec<CommitInfo>, String> {
    let path = Path::new(repo_path);

    if !path.exists() {
        return Err(format!("Repository path does not exist: {}", repo_path));
    }

    // Run git log with custom format: hash|short_hash|message|author|date
    let output = Command::new("git")
        .args([
            "log",
            &format!("-{}", limit),
            "--format=%H|%h|%s|%an|%ai",
        ])
        .current_dir(path)
        .output()
        .map_err(|e| format!("Failed to run git log: {}", e))?;

    if !output.status.success() {
        return Err(format!(
            "git log failed: {}",
            String::from_utf8_lossy(&output.stderr)
        ));
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    let mut commits = Vec::new();

    for line in stdout.lines() {
        let parts: Vec<&str> = line.splitn(5, '|').collect();
        if parts.len() == 5 {
            commits.push(CommitInfo {
                hash: parts[0].to_string(),
                short_hash: parts[1].to_string(),
                message: parts[2].to_string(),
                author: parts[3].to_string(),
                date: parts[4].to_string(),
            });
        }
    }

    Ok(commits)
}

/// Core logic: Gets the base64-encoded content of a file at a specific commit
pub fn get_file_at_commit_impl(
    repo_path: &str,
    file_path: &str,
    commit_hash: &str,
) -> Result<String, String> {
    let path = Path::new(repo_path);

    if !path.exists() {
        return Err(format!("Repository path does not exist: {}", repo_path));
    }

    // Run git show {commit}:{file_path}
    let output = Command::new("git")
        .args(["show", &format!("{}:{}", commit_hash, file_path)])
        .current_dir(path)
        .output()
        .map_err(|e| format!("Failed to run git show: {}", e))?;

    if !output.status.success() {
        return Err(format!(
            "File does not exist at commit {}: {}",
            commit_hash,
            String::from_utf8_lossy(&output.stderr)
        ));
    }

    // Encode the binary content as base64
    Ok(STANDARD.encode(&output.stdout))
}

// ============================================
// Tauri Commands (thin wrappers around core logic)
// ============================================

#[tauri::command]
fn validate_git_repo(path: &str) -> Result<bool, String> {
    validate_git_repo_impl(path)
}

#[tauri::command]
fn get_changed_files(repo_path: &str) -> Result<Vec<ChangedFile>, String> {
    get_changed_files_impl(repo_path)
}

#[tauri::command]
fn get_file_at_head(repo_path: &str, file_path: &str) -> Result<String, String> {
    get_file_at_head_impl(repo_path, file_path)
}

#[tauri::command]
fn get_commits(repo_path: &str, limit: u32) -> Result<Vec<CommitInfo>, String> {
    get_commits_impl(repo_path, limit)
}

#[tauri::command]
fn get_file_at_commit(
    repo_path: &str,
    file_path: &str,
    commit_hash: &str,
) -> Result<String, String> {
    get_file_at_commit_impl(repo_path, file_path, commit_hash)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            validate_git_repo,
            get_changed_files,
            get_file_at_head,
            get_commits,
            get_file_at_commit
        ])
        .setup(|app| {
            #[cfg(debug_assertions)]
            {
                let window = app.get_webview_window("main").unwrap();
                window.open_devtools();
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use std::process::Command;
    use tempfile::TempDir;

    /// Helper to create a temporary git repository for testing
    fn create_test_git_repo() -> TempDir {
        let temp_dir = TempDir::new().expect("Failed to create temp dir");
        let path = temp_dir.path();

        // Initialize git repo
        Command::new("git")
            .args(["init"])
            .current_dir(path)
            .output()
            .expect("Failed to init git repo");

        // Configure git user for commits
        Command::new("git")
            .args(["config", "user.email", "test@test.com"])
            .current_dir(path)
            .output()
            .expect("Failed to configure git email");

        Command::new("git")
            .args(["config", "user.name", "Test User"])
            .current_dir(path)
            .output()
            .expect("Failed to configure git user");

        temp_dir
    }

    // ============================================
    // Tests for validate_git_repo_impl
    // ============================================

    #[test]
    fn test_validate_git_repo_returns_true_for_valid_repo() {
        let temp_repo = create_test_git_repo();
        let path = temp_repo.path().to_str().unwrap();

        let result = validate_git_repo_impl(path);

        assert!(result.is_ok(), "Expected Ok result, got {:?}", result);
        assert!(result.unwrap(), "Expected true for valid git repo");
    }

    #[test]
    fn test_validate_git_repo_returns_false_for_non_git_directory() {
        let temp_dir = TempDir::new().expect("Failed to create temp dir");
        let path = temp_dir.path().to_str().unwrap();

        let result = validate_git_repo_impl(path);

        assert!(result.is_ok(), "Expected Ok result, got {:?}", result);
        assert!(!result.unwrap(), "Expected false for non-git directory");
    }

    #[test]
    fn test_validate_git_repo_returns_error_for_nonexistent_path() {
        let result = validate_git_repo_impl("/nonexistent/path/that/does/not/exist");

        assert!(result.is_err(), "Expected Err result for nonexistent path");
    }

    // ============================================
    // Tests for get_changed_files_impl
    // ============================================

    #[test]
    fn test_get_changed_files_returns_empty_for_clean_repo() {
        let temp_repo = create_test_git_repo();
        let path = temp_repo.path().to_str().unwrap();

        let result = get_changed_files_impl(path);

        assert!(result.is_ok(), "Expected Ok result, got {:?}", result);
        assert!(result.unwrap().is_empty(), "Expected empty list for clean repo");
    }

    #[test]
    fn test_get_changed_files_detects_modified_png() {
        let temp_repo = create_test_git_repo();
        let path = temp_repo.path();
        let path_str = path.to_str().unwrap();

        // Create and commit an image file
        let image_path = path.join("test.png");
        fs::write(&image_path, b"fake png content").expect("Failed to write image");

        Command::new("git")
            .args(["add", "test.png"])
            .current_dir(path)
            .output()
            .expect("Failed to add file");

        Command::new("git")
            .args(["commit", "-m", "Initial commit"])
            .current_dir(path)
            .output()
            .expect("Failed to commit");

        // Modify the image
        fs::write(&image_path, b"modified png content").expect("Failed to modify image");

        let result = get_changed_files_impl(path_str);

        assert!(result.is_ok(), "Expected Ok result, got {:?}", result);
        let files = result.unwrap();
        assert_eq!(files.len(), 1, "Expected 1 changed file");
        assert_eq!(files[0].path, "test.png");
        assert_eq!(files[0].status, "modified");
    }

    #[test]
    fn test_get_changed_files_detects_new_image() {
        let temp_repo = create_test_git_repo();
        let path = temp_repo.path();
        let path_str = path.to_str().unwrap();

        // Create initial commit (needed for git status to work properly)
        fs::write(path.join("README.md"), "readme").expect("Failed to write readme");
        Command::new("git")
            .args(["add", "."])
            .current_dir(path)
            .output()
            .expect("Failed to add");
        Command::new("git")
            .args(["commit", "-m", "Initial"])
            .current_dir(path)
            .output()
            .expect("Failed to commit");

        // Create a new untracked image
        fs::write(path.join("new.jpg"), b"new jpg content").expect("Failed to write new image");

        let result = get_changed_files_impl(path_str);

        assert!(result.is_ok(), "Expected Ok result, got {:?}", result);
        let files = result.unwrap();
        assert_eq!(files.len(), 1, "Expected 1 new file");
        assert_eq!(files[0].path, "new.jpg");
        assert_eq!(files[0].status, "added");
    }

    #[test]
    fn test_get_changed_files_ignores_non_image_files() {
        let temp_repo = create_test_git_repo();
        let path = temp_repo.path();
        let path_str = path.to_str().unwrap();

        // Create initial commit
        fs::write(path.join("README.md"), "readme").expect("Failed to write readme");
        Command::new("git")
            .args(["add", "."])
            .current_dir(path)
            .output()
            .expect("Failed to add");
        Command::new("git")
            .args(["commit", "-m", "Initial"])
            .current_dir(path)
            .output()
            .expect("Failed to commit");

        // Add a non-image file
        fs::write(path.join("code.rs"), "fn main() {}").expect("Failed to write code file");

        let result = get_changed_files_impl(path_str);

        assert!(result.is_ok(), "Expected Ok result, got {:?}", result);
        let files = result.unwrap();
        assert!(files.is_empty(), "Expected no files (code.rs should be ignored)");
    }

    // ============================================
    // Tests for get_file_at_head_impl
    // ============================================

    #[test]
    fn test_get_file_at_head_returns_base64_content() {
        let temp_repo = create_test_git_repo();
        let path = temp_repo.path();
        let path_str = path.to_str().unwrap();

        // Create and commit an image file
        let content = b"test image content";
        fs::write(path.join("test.png"), content).expect("Failed to write image");

        Command::new("git")
            .args(["add", "test.png"])
            .current_dir(path)
            .output()
            .expect("Failed to add file");

        Command::new("git")
            .args(["commit", "-m", "Add image"])
            .current_dir(path)
            .output()
            .expect("Failed to commit");

        let result = get_file_at_head_impl(path_str, "test.png");

        assert!(result.is_ok(), "Expected Ok result, got {:?}", result);

        // Verify the base64 decodes to original content
        let base64_content = result.unwrap();
        let decoded = STANDARD.decode(&base64_content).expect("Failed to decode base64");
        assert_eq!(decoded, content, "Decoded content should match original");
    }

    #[test]
    fn test_get_file_at_head_returns_error_for_new_file() {
        let temp_repo = create_test_git_repo();
        let path = temp_repo.path();
        let path_str = path.to_str().unwrap();

        // Create initial commit
        fs::write(path.join("README.md"), "readme").expect("Failed to write readme");
        Command::new("git")
            .args(["add", "."])
            .current_dir(path)
            .output()
            .expect("Failed to add");
        Command::new("git")
            .args(["commit", "-m", "Initial"])
            .current_dir(path)
            .output()
            .expect("Failed to commit");

        // Create a new file that hasn't been committed
        fs::write(path.join("new.png"), b"new content").expect("Failed to write new file");

        let result = get_file_at_head_impl(path_str, "new.png");

        // Should return error since file doesn't exist at HEAD
        assert!(result.is_err(), "Expected error for file not in HEAD");
    }

    // ============================================
    // Tests for is_image_file helper
    // ============================================

    #[test]
    fn test_is_image_file_recognizes_common_formats() {
        assert!(is_image_file("photo.png"));
        assert!(is_image_file("photo.PNG"));
        assert!(is_image_file("photo.jpg"));
        assert!(is_image_file("photo.jpeg"));
        assert!(is_image_file("icon.svg"));
        assert!(is_image_file("animation.gif"));
        assert!(is_image_file("modern.webp"));
    }

    #[test]
    fn test_is_image_file_rejects_non_images() {
        assert!(!is_image_file("code.rs"));
        assert!(!is_image_file("style.css"));
        assert!(!is_image_file("script.js"));
        assert!(!is_image_file("README.md"));
        assert!(!is_image_file("data.json"));
    }

    // ============================================
    // Tests for get_commits_impl
    // ============================================

    #[test]
    fn test_get_commits_returns_commit_history() {
        let temp_repo = create_test_git_repo();
        let path = temp_repo.path();
        let path_str = path.to_str().unwrap();

        // Create first commit
        fs::write(path.join("file1.txt"), "content 1").expect("Failed to write file1");
        Command::new("git")
            .args(["add", "."])
            .current_dir(path)
            .output()
            .expect("Failed to add files");
        Command::new("git")
            .args(["commit", "-m", "First commit"])
            .current_dir(path)
            .output()
            .expect("Failed to create first commit");

        // Create second commit
        fs::write(path.join("file2.txt"), "content 2").expect("Failed to write file2");
        Command::new("git")
            .args(["add", "."])
            .current_dir(path)
            .output()
            .expect("Failed to add files");
        Command::new("git")
            .args(["commit", "-m", "Second commit"])
            .current_dir(path)
            .output()
            .expect("Failed to create second commit");

        let result = get_commits_impl(path_str, 10);

        assert!(result.is_ok(), "Expected Ok result, got {:?}", result);
        let commits = result.unwrap();
        assert_eq!(commits.len(), 2, "Expected 2 commits");

        // Most recent commit should be first
        assert_eq!(commits[0].message, "Second commit");
        assert_eq!(commits[1].message, "First commit");

        // Verify commit info structure
        assert!(!commits[0].hash.is_empty(), "Hash should not be empty");
        assert!(!commits[0].short_hash.is_empty(), "Short hash should not be empty");
        assert!(!commits[0].author.is_empty(), "Author should not be empty");
        assert!(!commits[0].date.is_empty(), "Date should not be empty");
    }

    // ============================================
    // Tests for get_file_at_commit_impl
    // ============================================

    #[test]
    fn test_get_file_at_commit_returns_correct_content() {
        let temp_repo = create_test_git_repo();
        let path = temp_repo.path();
        let path_str = path.to_str().unwrap();

        // Create first commit with initial content
        let initial_content = b"initial image content";
        fs::write(path.join("test.png"), initial_content).expect("Failed to write file");
        Command::new("git")
            .args(["add", "."])
            .current_dir(path)
            .output()
            .expect("Failed to add files");
        Command::new("git")
            .args(["commit", "-m", "First commit"])
            .current_dir(path)
            .output()
            .expect("Failed to create first commit");

        // Get the first commit hash
        let output = Command::new("git")
            .args(["rev-parse", "HEAD"])
            .current_dir(path)
            .output()
            .expect("Failed to get commit hash");
        let first_commit_hash = String::from_utf8_lossy(&output.stdout).trim().to_string();

        // Create second commit with modified content
        let modified_content = b"modified image content";
        fs::write(path.join("test.png"), modified_content).expect("Failed to write modified file");
        Command::new("git")
            .args(["add", "."])
            .current_dir(path)
            .output()
            .expect("Failed to add files");
        Command::new("git")
            .args(["commit", "-m", "Second commit"])
            .current_dir(path)
            .output()
            .expect("Failed to create second commit");

        // Get file content at first commit
        let result = get_file_at_commit_impl(path_str, "test.png", &first_commit_hash);

        assert!(result.is_ok(), "Expected Ok result, got {:?}", result);
        let base64_content = result.unwrap();
        let decoded = STANDARD.decode(&base64_content).expect("Failed to decode base64");
        assert_eq!(decoded, initial_content, "Content at first commit should match initial content");
    }
}
