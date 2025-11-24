
# Pixeli (Pre-release) [![npm version](https://img.shields.io/github/package-json/version/pakdad-mousavi/pixeli)](https://www.npmjs.com/package/pixeli) [![License](https://img.shields.io/github/license/pakdad-mousavi/pixeli)](./LICENSE)

<img src="./assets/logo.svg" width="150" align="right">

**Pixeli** is a lightweight and flexible command-line tool for merging multiple images into clean, customizable grid layouts. It’s designed for speed and simplicity, making it ideal for generating collages, previews, gallery layouts, inspiration boards, and composite images without relying on heavy desktop software.

Pixeli uses Sharp, a Node.js wrapper for the libvips library which is based on C. This makes it an extremely fast tool with support for PNG, JPG, GIF, SVG, AVIF, etc.

The tool currently supports two main layout modes: ***Grid*** and ***Masonry*** (horizontal / vertical). Each of them provide a distinct visual style to match a project's needs, for example:

| Grid (1:1 images) | Contact Sheet Grid |
|---|---|
| <img src="samples/grid.png" width="400"> | <img src="samples/grid-with-captions.png" width="400"> |
| **Masonry (Horizontal)** | **Masonry (Vertical)** |
| <img src="samples/masonry-horizontal.png" width="400"> | <img src="samples/masonry-vertical.png" width="400"> |

## Installation
Pixeli can be installed using npm. Simply run the following command to install it globally on your machine:
```bash
npm i -g pixeli
```

You can also run pixeli directly with npx without installing it globally. This is convenient for quick experiments or one-off usage:
```bash
npx pixeli merge <subcommand> [options] <files...>
```

## Quick Examples
To run these examples, you can visit the [GitHub Repository](https://github.com/pakdad-mousavi/pixeli) and use the images in the [Samples](https://github.com/pakdad-mousavi/pixeli/blob/main/samples/) directory, if you don't already have your own set of images.

All merge commands are under the `pixeli merge` command and can be used like so: `pixeli merge [merge-mode] [options]`

### Basic Grid
To create a basic grid with 1:1 images, you can use the grid merge command. You'll also need to provide the individual filepaths to use, or use the `-rd` (--recursive and --directory) flags to get all the images from the specified directory:
```bash
pixeli merge grid -rd ./samples/images
```

Without the `-r` flag, only the images in the directory will be scanned, and any sub-directories will be ignored.

### Grid with Rectangular Images
To create a grid with images that all have the same aspect ratio, you can specify the aspect ratio to use for all images using the `--ar` flag:
```bash
pixeli merge grid -rd ./samples/images --ar 16:9
```

### Grid with 8 Columns
You can also customize the number of columns that you'd like the final image to have using the `-c` flag, followed by the number of columns:
```bash
pixeli merge grid -rd ./samples/images -c 8
```

### Contact Sheet
Contact sheet style grids can also be made using pixeli. To include each file name under its respective image, the `--ca` flag can be used:
```bash
pixeli merge grid -rd ./samples/images --ca
```

The caption color can also be specified using the `--cc` flag, followed by a hex color:
```bash
pixeli merge grid -rd ./samples/images --ca --cc "#ff0000"
```

### Masonry Layout
To create a masonry style image, you can use the masonry merge command. The `-rd` flag is used to specify which directory to use, and the canvas width can be specified using the `--cvw` flag:
```bash
pixeli merge masonry -rd ./samples/images --cvw 4000
```

By default, the masonry merge command uses a horizontal flow, but a vertical one can be specified using the `-f` flag, followed by the `--cvh` to specify the canvas height:
```bash
pixeli merge masonry -rd ./samples/images -f vertical --cvh 4000
```

## Full Documentation

### pixeli merge
Usage: `pixeli merge <subcommand> [options] <input...> -o <output>`

The merge command is what allows you to create grids and mosaics with your images.
| Subcommand | Description                                                                                                                                       | Options                                                          |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `grid`     | Merge images into a uniform **rows × columns grid**, optionally with captions and per-image aspect ratios.                                        | See [grid options table](#pixeli-merge-grid)                     |
| `masonry`  | Merge images into a **dynamic masonry layout**, preserving natural image proportions. Supports vertical or horizontal flow and alignment options. | See [masonry options table](#pixeli-merge-masonry)               |

The following options and flags are shared for all of the subcommands under the `pixeli merge` command:
| Option                         | Default        | Description                                                                                                                        |
| ------------------------------ | -------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `[files...]`                   | —              | Image file paths to merge. You can specify multiple files or if you prefer directories, use `--dir`.                               |
| `-d`, `--dir <path>`           | —              | Path to a **directory containing images** to merge. Can be used instead of listing files individually.                             |
| `-r`, `--recursive`            | `false`        | Include **images in all subdirectories** of the specified directory recursively.                                                   |
| `--sh`, `--shuffle`            | `false`        | **Randomize the order** of images before merging. Useful for creating visually varied grids or collages.                           |
| `-g`, `--gap <px>`             | `50`           | **Spacing (in pixels) between images** in the layout. Applies to both horizontal and vertical gaps.                                |
| `--bg`, `--canvas-color <hex>` | `#ffffff`      | Sets the **background color of the canvas**. Accepts HEX values (e.g., `#000000` for black).                                       |
| `-o`, `--output <file>`        | `./pixeli.png` | Path for the **merged output image**. The format is inferred from the file extension (`.png`, `.jpg`, `.webp`, etc.).              |


### pixeli merge grid
Usage: `pixeli merge grid [options] [files...]`

The grid mode arranges images into a clean, uniform grid with fixed columns and automatic row calculation. The table below displays all of the options available to this command:
| Option/Flag                                     | Default                | Description                                                                                                                                                                              |
| ----------------------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--ar`, `--aspect-ratio <width/height\|number>` | `1:1`                  | Sets the **per-image aspect ratio**. Accepts ratio expressions (`16/9`, `4:3`) or decimal values (`1.777`). Images are scaled as needed to match this ratio before placement.            |
| `-w`, `--image-width <px>`                      | *smallest input width* | Sets the **final width of each processed image** in the grid. The height is derived automatically based on the chosen aspect ratio.                                                      |
| `-c`, `--columns <n>`                           | `4`                    | Defines how many **images per row** are placed in the grid. The total number of rows is calculated from the number of inputs.                                                            |
| `--ca`, `--caption`                             | `false`                | Enables **automatic captions** under each image. Captions are derived from the filename (with extensions).                                                                               |
| `--cc`, `--caption-color <hex>`                 | `#000000`              | HEX color value for caption text (e.g., `#ffffff`, `#ff9900`). Affects all captions uniformly.                                                                                           |
| `--mcs`, `--max-caption-size <pt>`              | `100`                  | Sets the **maximum allowed caption font size**. Useful when images are extremely large and the caption is not big enough. The renderer may auto-reduce the font size if necessary.       |

### pixeli merge masonry
Usage: `pixeli merge masonry [options] [files...]`

The masonry mode preserves each image’s natural shape, creating an organic brick-wall layout similar to Pinterest boards.

| Option/Flag                                          | Default                 | Description                                                                                                                                            |
| ---------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `--rh`, `--row-height <px>`                          | *smallest input height* | Sets the **target height for all images in a row** when using `horizontal` flow. Images are scaled proportionally based on this height.                |
| `--cw`, `--column-width <px>`                        | *smallest input width*  | Sets the **target width for all images in a column** when using `vertical` flow. Images are scaled proportionally based on this width.                 |
| `--cvw`, `--canvas-width <px>`                       | –                       | Sets the **fixed width** of the final output canvas. Required when using a `horizontal` flow to know when to break a row.                              |
| `--cvh`, `--canvas-height <px>`                      | –                       | Sets the **fixed height** of the final output canvas. Required when using a `vertical` flow to know when to break a column.                            |
| `-f`, `--flow <horizontal\|vertical>`                | `horizontal`            | Determines the **flow direction** of the masonry layout. `horizontal` creates rows of varying widths; `vertical` creates columns of varying heights.   |
| `--ha`, `--h-align <left\|center\|right\|justified>` | `justified`             | Controls **horizontal alignment** of rows when in `horizontal` flow. `justified` overfills each row and crops the final image to fill up the canvas.   |
| `--va`, `--v-align <top\|middle\|bottom\|justified>` | `justified`             | Controls **vertical alignment** of columns when in `vertical` flow. `justified` overfills each column and crops the final image to fill up the canvas. |

## License
This project is licensed under the [MIT License](./LICENSE).

## Other
This project was submitted to [Hack Club](https://hackclub.com/), a group consisting of over 100,000 teen hackers from around the world who work on cool projects and get to participate in awesome programs like [Midnight](https://midnight.hackclub.com).