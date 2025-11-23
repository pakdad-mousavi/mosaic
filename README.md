
# Pixeli (Pre-release) [![npm version](https://img.shields.io/badge/npm-v0.1.1-blue)](https://www.npmjs.com/package/pixeli)

<img src="./assets/logo.svg" width="125" height="125" align="left" style="margin-right: 10px">

**Pixeli** is a lightweight and flexible command-line tool for merging multiple images into clean, customizable grid layouts. It’s designed for speed and simplicity, making it ideal for generating collages, previews, gallery layouts, inspiration boards, and composite images without relying on heavy desktop software.

The tool currently supports two main layout modes: ***Grid*** and ***Masonry*** (horizontal / vertical). Each of them provide a distinct visual style to match a project's needs, for example:

<div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; width: 100%; margin: 0 auto 20px auto;">
  <div style="display: flex; width: 80%; gap: 20px;">
    <div style="display: flex; flex-direction: column; text-align: center;">
      <h3 style="border-bottom: 1px solid #fff; padding-bottom: 10px">Grid (1:1 images)</h3>
      <img src="./samples/grid.png">
    </div>
    <div style="display: flex; flex-direction: column; text-align: center;">
      <h3 style="border-bottom: 1px solid #fff; padding-bottom: 10px">Grid (with captions)</h3>
      <img src="./samples/grid-with-captions.png">
    </div>
  </div>
  <div style="display: flex; width: 80%; gap: 20px;">
    <div style="display: flex; flex-direction: column; text-align: center;">
      <h3 style="border-bottom: 1px solid #fff; padding-bottom: 10px">Masonry (Horizontal)</h3>
      <img src="./samples/masonry-horizontal.png">
    </div>
    <div style="display: flex; flex-direction: column; text-align: center;">
      <h3 style="border-bottom: 1px solid #fff; padding-bottom: 10px">Masonry (Vertical)</h3>
      <img src="./samples/masonry-vertical.png">
    </div>
  </div>
</div>

# Installation
Pixeli can be installed using NPM. Simply run the following command to install it globally on your machine:
```bash
npm i -g pixeli
```

# Quick Examples
To run these examples, you can visit the [GitHub Repository](https://github.com/pakdad-mousavi/pixeli) and use the images in the [Samples](https://github.com/pakdad-mousavi/pixeli/blob/main/samples/) directory, if you don't already have your own set of images.

All merge commands are under the `pixeli merge` command and can be used like so: `pixeli merge [merge-mode] [options]`

## Basic Grid
To create a basic grid with 1:1 images, ...

## Grid With Rectangular Images
To create a grid with images that all have the same aspect ratio, ...

## Contact Sheet
To create a basic grid with 1:1 images, ...

## Masonry Layout
To create a basic grid with 1:1 images, ...

# Full Documentation

