# Node Modules Cleaner

Removes node_modules directories in all child directories

###### Was not tested with symlinks

Usage:

> npx nmc

Examples:

```
PS C:\Code> npx nmc
nmc done!
```

For more logging add the --log / -l flag

```
PS C:\Code> npx nmc -l
 Searching...
Directories found: [
  'C:\\Code\\nodejs\\project\\node_modules',
  'C:\\Code\\nodejs\\project2\\node_modules'
]
 nmc done!
```
