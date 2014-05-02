# Install build dependencies from package.json
npm install --quiet

# Usually installed globally, but not so on CI server
npm install bower grunt-cli --quiet

# Install client-side dependencies (i.e. JS libraries)
# '--config.proxy' makes Bower translate git://github.com to https://github.com
node_modules/bower/bin/bower install --quiet --config.proxy

# Build HTML, CSS, and JS
node_modules/grunt-cli/bin/grunt build

# Run JS unit tests
node_modules/grunt-cli/bin/grunt karma:ci
