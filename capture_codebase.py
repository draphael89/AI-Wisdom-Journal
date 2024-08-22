import os
import sys

def capture_codebase_structure(root_dir, output_file):
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(f"Codebase structure for: {os.path.abspath(root_dir)}\n")
        f.write("=" * 50 + "\n\n")
        
        for dirpath, dirnames, filenames in os.walk(root_dir):
            # Exclude node_modules directory
            if 'node_modules' in dirnames:
                dirnames.remove('node_modules')
            
            # Exclude package-lock.json
            filenames = [f for f in filenames if f != 'package-lock.json']
            
            level = dirpath.replace(root_dir, '').count(os.sep)
            indent = '  ' * level
            f.write(f'{indent}{os.path.basename(dirpath)}/\n')
            sub_indent = '  ' * (level + 1)
            for filename in sorted(filenames):
                file_path = os.path.join(dirpath, filename)
                file_size = os.path.getsize(file_path)
                f.write(f'{sub_indent}{filename} ({file_size} bytes)\n')
                
                # Add file content
                f.write(f'{sub_indent}Content:\n')
                try:
                    with open(file_path, 'r', encoding='utf-8') as file_content:
                        content = file_content.read()
                        f.write(f'```{os.path.splitext(filename)[1][1:]}\n')
                        f.write(content)
                        f.write('\n```\n\n')
                except Exception as e:
                    f.write(f'{sub_indent}  Unable to read file content: {str(e)}\n\n')
        
        f.write("\nExcluded: node_modules/, package-lock.json\n")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python capture_codebase.py <project_root_path>")
        sys.exit(1)

    project_root = sys.argv[1]
    output_file = 'codebase_structure.txt'

    if not os.path.isdir(project_root):
        print(f"Error: {project_root} is not a valid directory.")
        sys.exit(1)

    capture_codebase_structure(project_root, output_file)
    print(f"Codebase structure has been saved to {os.path.abspath(output_file)}")