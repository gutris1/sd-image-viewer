from pathlib import Path

from modules.paths_internal import extensions_dir
from modules.launch_utils import git_clone

def req():
    n = 'sd-image-scripts'
    p = Path(extensions_dir) / n
    if not p.exists(): git_clone(f'https://github.com/gutris1/{n}', str(p), n)

req()