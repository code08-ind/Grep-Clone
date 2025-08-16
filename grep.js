const fs = require("fs");
const path = require("path");

function getAllFiles(dir, baseDir = dir) {
    let files = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            // Recursively get files from subdirectory
            files = files.concat(getAllFiles(fullPath, baseDir));
        } else if (stat.isFile()) {
            // Add file with path relative to baseDir
            files.push(fullPath);
        }
    }
    
    return files;
}

function matchPattern(inputLine, pattern) {
    // Handle simple single character patterns
    if (pattern.length === 1) {
        return inputLine.includes(pattern);
    }
    
    // Handle special escape sequences
    if (pattern === "\\d") {
        return /\d/.test(inputLine);
    } else if (pattern === "\\w") {
        return /\w/.test(inputLine);
    }
    
    // Handle character classes [abc]
    if (pattern[0] === "[" && pattern[pattern.length - 1] === "]") {
        const chars = pattern.slice(1, -1);
        const regEx = new RegExp(`[${chars}]`);
        return regEx.test(inputLine);
    }
    
    // Handle patterns with backslashes (escape sequences)
    if (pattern.includes("\\")) {
        const regex = new RegExp(pattern);
        return regex.test(inputLine);
    }
    
    // Handle complex patterns with +, ?, or . BEFORE simple anchors
    if (pattern.includes("+") || pattern.includes("?") || pattern.includes(".")) {
        const regex = new RegExp(pattern);
        return regex.test(inputLine);
    }
    
    // Handle alternation (word1|word2)
    if (pattern.includes("(") && pattern.includes("|") && pattern.includes(")")) {
        const chars = pattern.slice(
            pattern.indexOf("(") + 1,
            pattern.indexOf(")"),
        );
        const [word_1, word_2] = chars.split("|");
        return inputLine.includes(word_1) || inputLine.includes(word_2);
    }
    
    // Handle simple start anchor ^ (only for patterns without other metacharacters)
    if (pattern[0] === "^") {
        const comp = pattern.slice(1);
        return inputLine.startsWith(comp);
    }
    
    // Handle simple end anchor $ (only for patterns without other metacharacters)
    if (pattern[pattern.length - 1] === "$") {
        const comp = pattern.slice(0, pattern.length - 1);
        return inputLine.endsWith(comp);
    }
    
    // Default: simple substring match
    return inputLine.includes(pattern);
}

function main() {
    if (process.argv[2] !== "-E" && process.argv[2] !== "-r") {
        console.log("Expected first argument to be '-E' or '-r'");
        process.exit(1);
    }

    let isRecursive = false;
    let pattern, targets;
    
    if (process.argv[2] === "-r" && process.argv[3] === "-E") {
        // -r -E pattern directory
        isRecursive = true;
        pattern = process.argv[4];
        targets = process.argv.slice(5);
    } else if (process.argv[2] === "-E") {
        // -E pattern [files...]
        pattern = process.argv[3];
        targets = process.argv.slice(4);
    } else {
        console.log("Invalid argument combination");
        process.exit(1);
    }

    let found = false;
    
    if (targets.length > 0) {
        let filesToProcess = [];
        
        if (isRecursive) {
            // For recursive mode, get all files from directories
            for (const target of targets) {
                const stat = fs.statSync(target);
                if (stat.isDirectory()) {
                    filesToProcess = filesToProcess.concat(getAllFiles(target));
                } else {
                    filesToProcess.push(target);
                }
            }
        } else {
            // For non-recursive mode, use targets as files directly
            filesToProcess = targets;
        }
        
        const multipleFiles = filesToProcess.length > 1 || isRecursive;
        
        for (const filename of filesToProcess) {
            try {
                const inputLines = fs.readFileSync(filename, "utf-8").split(/\r?\n/);
                
                for (const line of inputLines) {
                    if (matchPattern(line.trim(), pattern)) {
                        if (multipleFiles) {
                            console.log(`${filename}:${line}`);
                        } else {
                            console.log(line);
                        }
                        found = true;
                    }
                }
            } catch (e) {
                // Skip files that can't be read
                continue;
            }
        }
    } else {
        // Read from stdin (single line)
        const inputLines = [fs.readFileSync(0, "utf-8").trim()];
        
        for (const line of inputLines) {
            if (matchPattern(line.trim(), pattern)) {
                console.log(line);
                found = true;
            }
        }
    }

    process.exit(found ? 0 : 1);
}

main();
