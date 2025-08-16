# Grep Clone (Node.js)

A lightweight **grep-like command-line utility** built in Node.js.
It allows searching for patterns in files, directories (recursively), or standard input — mimicking core functionality of GNU `grep`.

---

## 🚀 Features

* **Pattern Matching**

  * Supports simple substring search
  * Character classes `[abc]`
  * Escape sequences like `\d`, `\w`
  * Anchors `^` (start) and `$` (end)
  * Alternation `(word1|word2)`
  * Quantifiers `+`, `?`
  * Dot `.` (any character)

* **Recursive Search**

  * With `-r`, search entire directories and their subdirectories.

* **Multiple File Support**

  * Handles one or many files, with file names prefixed in multi-file output.

* **Standard Input**

  * Works with piped input when no files are specified.

* **Exit Codes**

  * `0` → match found
  * `1` → no match found

---

## 📦 Installation

Clone the repo and run directly with Node:

```bash
git clone https://github.com/yourusername/grep-clone.git
cd grep-clone
node grep.js -E pattern file.txt
```

Optionally, make it globally accessible:

```bash
chmod +x grep.js
ln -s $(pwd)/grep.js /usr/local/bin/mygrep
```

Then you can use:

```bash
mygrep -E foo file.txt
```

---

## 🛠 Usage

### Syntax

```bash
node grep.js -E <pattern> [files...]
node grep.js -r -E <pattern> [directories...]
```

### Examples

#### 1. Search in a single file

```bash
node grep.js -E hello file.txt
```

Matches lines containing `hello`.

#### 2. Search recursively in a directory

```bash
node grep.js -r -E "error" ./logs
```

Matches all lines containing `error` across all files under `logs/`.

#### 3. Use regex-like patterns

```bash
node grep.js -E "foo|bar" file.txt
```

Matches lines containing either `foo` or `bar`.

```bash
node grep.js -E "^[0-9]+" numbers.txt
```

Matches lines starting with a number.

#### 4. Character classes

```bash
node grep.js -E "[abc]" file.txt
```

Matches lines containing `a`, `b`, or `c`.

#### 5. Piped input

```bash
echo "hello world" | node grep.js -E hello
```

Output: `hello world`

---

## ⚙️ Internals (How it works)

* **File traversal**: Uses `fs.readdirSync` and recursion for `-r` to gather all files.
* **Pattern Matching**:
  Implemented via a custom `matchPattern` function that:

  * Detects simple patterns (`includes`)
  * Converts regex-like patterns into `RegExp` objects for matching
  * Handles anchors, alternation, and classes manually.
* **I/O**: Reads files line by line (`fs.readFileSync` + split on `\n`).
* **CLI Arguments**:

  * `-E` → pattern matching mode (with regex-like syntax)
  * `-r` → recursive directory traversal

---

## ✅ Salient Points

* Pure Node.js, **no external dependencies**.
* Mimics `grep` behavior for everyday use.
* Recursive search with `-r`.
* Supports stdin for pipe workflows.
* Exit codes follow Unix conventions.
