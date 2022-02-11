## How to install
```bash
git clone https://github.com/ChaosZhai/cmuhole
cd cmuhole

# Edit environment configs
vim .env

# Build
VERSION_NUMBER="v$(grep -oP '"version": "\K[^"]+' package.json | head -n1)"
REACT_APP_BUILD_INFO=$VERSION_NUMBER npm run build
```