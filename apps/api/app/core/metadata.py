from functools import lru_cache
from pathlib import Path
from tomllib import load


@lru_cache(maxsize=1)
def get_app_version() -> str:
    pyproject_path = Path(__file__).resolve().parents[2] / "pyproject.toml"

    try:
        with pyproject_path.open("rb") as file:
            data = load(file)
    except FileNotFoundError:
        return "0.1.0"

    project = data.get("project", {})
    version = project.get("version")
    return version or "0.1.0"
