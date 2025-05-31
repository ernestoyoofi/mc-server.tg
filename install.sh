# Variable
APP_LAST_VERSION="1.10.2-release"
APP_FILENAME="mc-server.tg.zip"
APP_BUILD_DIR="build-mc-server"
APP_URLDOWNLOAD="https://github.com/ernestoyoofi/mc-server.tg/releases/download/$APP_LAST_VERSION/$APP_LAST_VERSION-mc-server.tg.zip"
# Checking Installation
echo "URL: $APP_URLDOWNLOAD"
if ! command -v node >/dev/null 2>&1; then
  echo "[Error]: Node.js is required but not found. Please install Node.js and npm."
  exit 1
fi
if ! command -v npm >/dev/null 2>&1; then
  echo "[Error]: npm is required but not found. Please install Node.js and npm."
  exit 1
fi
echo "[Log]: Create Folder Build..."
mkdir -p "$APP_BUILD_DIR"
cd "$APP_BUILD_DIR" || exit
echo "[Log]: Download..."
if ! command -v curl >/dev/null 2>&1; then
  echo "[Log]: 'curl' not found. Installing..."
  if command -v apt >/dev/null 2>&1; then
    sudo apt install curl -y
  elif command -v dnf >/dev/null 2>&1; then
    sudo dnf install curl -y
  elif command -v pacman >/dev/null 2>&1; then
    sudo pacman -Sy curl
  else
    echo "[Error]: 'curl' is not installed and automatic installation is not supported on this OS."
    exit 1
  fi
fi
curl -L "$APP_URLDOWNLOAD" -o "$APP_FILENAME"
echo "[Log]: Unzip..."
echo "[Log]: Extracting..."
if ! command -v unzip >/dev/null 2>&1; then
  echo "[Log]: 'unzip' not found. Installing..."
  if command -v apt >/dev/null 2>&1; then
    sudo apt install unzip -y
  elif command -v dnf >/dev/null 2>&1; then
    sudo dnf install unzip -y
  elif command -v pacman >/dev/null 2>&1; then
    sudo pacman -Sy unzip
  else
    echo "[Error]: 'unzip' is not installed and automatic installation is not supported on this OS."
    exit 1
  fi
fi
unzip -o "$APP_FILENAME"
echo "[Log]: Installing..."
npm i
npm i -g
cd ..
echo "[Log]: Success!..."
echo "[Log]: Start Running With 'mcbess' !"