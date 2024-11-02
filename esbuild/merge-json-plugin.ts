import { PluginBuild } from 'esbuild';
const fs = require('fs');
const path = require('path');
const glob = require('glob');

const mergeJsonPlugin = {
  name: 'merge-json',
  setup(build: PluginBuild) {
    build.onStart(() => {
      // Define the JSON patterns and output files
      const jsonGroups = [
        { pattern: './src/i18n/en/*.json', outputFile: './src/i18n/en.json' },
        { pattern: './src/i18n/zh-tw/*.json', outputFile: './src/i18n/zh-tw.json' },
        // 其他需要合併的語言文件
      ];

      jsonGroups.forEach(group => {
        // Find all JSON files that match the pattern
        const files = glob.sync(group.pattern);
        const mergedData = {};

        files.forEach((file: any) => {
          const content = JSON.parse(fs.readFileSync(file, 'utf8'));
          Object.assign(mergedData, content);
        });

        // Ensure the output directory exists
        const outputDir = path.dirname(group.outputFile);
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true }); // Create the directory if it doesn't exist
        }

        // Write the merged JSON to the output file
        fs.writeFileSync(group.outputFile, JSON.stringify(mergedData, null, 2), 'utf8');
        console.log(`Merged JSON files for ${group.outputFile}`);
      });
    });
  },
};

module.exports = mergeJsonPlugin;
