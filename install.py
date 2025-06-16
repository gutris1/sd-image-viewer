from modules.paths_internal import extensions_dir
from pathlib import Path
import subprocess

def _Req():
    scr = Path(extensions_dir) / 'sd-image-scripts'
    if not scr.exists(): subprocess.run(['git', 'clone', '-q', 'https://github.com/gutris1/sd-image-scripts', str(scr)], check=True)

_Req()