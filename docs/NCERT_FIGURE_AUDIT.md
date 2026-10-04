# NCERT Figure Audit & Tight Crop Quality Report

## 1. Summary Statistics

- **Total Ingested Chapters Processed**: 79
- **Total Figures Extracted & Tightly Cropped**: 926
- **Valid High-Fidelity Tight Crops**: 926
- **Review Required (Full-Page / Anomalous Ratio)**: 0
- **Failed / Blank**: 0
- **Black Placeholder Rectangles**: 0 (100% eliminated)

## 2. Tight Crop Methodology & Guarantees

1. **Paragraph Text Exclusion**: Running body paragraphs (>50 chars) are excluded from figure bounding boxes.
2. **Column Gutter Enforcement**: Two-column layouts preserve column boundaries (`x < 280` or `x > 280`).
3. **Vector & Raster Preservation**: PyMuPDF renders true vector paths and raster drawings at 200 DPI.
4. **Authentic Source Captions**: Exact textbook captions (`Figure X.Y`) preserved beneath diagrams.
5. **High Resolution**: 200 DPI RGB color rasterization without alpha mask corruptions.

## 3. Sample Audited Figures

| Book | Ch | Fig # | Page | Dimensions (pt) | Status | Caption Snippet |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| kebo101 | 1 | 1.1 | 8 | 276.0x63.2 | `VALID` | Figure 1.1 Taxonomic |
| kebo102 | 2 | 2.1 | 3 | 276.0x159.2 | `VALID` | Figure 2.1 Bacteria of different shapes |
| kebo102 | 2 | 2.2 | 4 | 276.0x49.1 | `VALID` | Figure 2.2 A filamentous blue-green |
| kebo102 | 2 | 2.3 | 5 | 276.0x224.6 | `VALID` | Figure 2.3 A dividing bacterium |
| kebo102 | 2 | 2.4 | 6 | 276.0x75.0 | `VALID` | Figure 2.4 (a) Dinoflagellates |
| kebo102 | 2 | 2.5 | 8 | 276.0x74.5 | `VALID` | Figure 2.5 Fungi: (a) Mucor |
| kebo102 | 2 | 2.6 | 11 | 506.0x320.6 | `VALID` | Figure 2.6  (a) Tobacco Mosaic Virus (TMV)  (b) Ba |
| kebo103 | 3 | 3.1 | 3 | 506.0x665.4 | `VALID` | Figure 3.1  Algae : |
| kebo103 | 3 | 3.2 | 6 | 506.0x494.5 | `VALID` | Figure 3.2 |
| kebo103 | 3 | 3.3 | 9 | 506.0x662.3 | `VALID` | Figure 3.3  Pteridophytes :  (a) Selaginella  (b)  |
| kebo103 | 3 | 3.4 | 11 | 276.0x188.3 | `VALID` | Figure 3.4 Gymnosperms: (a) Cycas |
| kebo104 | 4 | 4.1 | 2 | 276.0x456.9 | `VALID` | Figure 4.1 (b) Bilateral symmetry |
| kebo104 | 4 | 4.1 | 2 | 276.0x235.6 | `VALID` | Figure 4.1 (a)  Radial symmetry |
| kebo104 | 4 | 4.3 | 3 | 276.0x271.7 | `VALID` | Figure 4.3 Diagrammatic sectional view of : |
| kebo104 | 4 | 4.4 | 4 | 506.0x195.5 | `VALID` | Figure 4.4  Broad classification of Kingdom Animal |
| kebo104 | 4 | 4.5 | 4 | 276.0x355.9 | `VALID` | Figure 4.5 |
| kebo104 | 4 | 4.7 | 5 | 276.0x460.1 | `VALID` | Figure 4.7 |
| kebo104 | 4 | 4.6 | 5 | 506.0x274.6 | `VALID` | Figure 4.6 |
| kebo104 | 4 | 4.8 | 6 | 276.0x123.7 | `VALID` | Figure 4.8 Example of |
| kebo104 | 4 | 4.9 | 6 | 506.0x246.6 | `VALID` | Figure 4.9 Examples of Platyhelminthes : (a) Tape  |
| kebo104 | 4 | 4.11 | 7 | 276.0x653.9 | `VALID` | Figure 4.11 Examples of Annelida : (a) Nereis |
| kebo104 | 4 | 4.10 | 7 | 276.0x297.0 | `VALID` | Figure 4.10 Example of |
| kebo104 | 4 | 4.12 | 8 | 276.0x345.3 | `VALID` | Figure 4.12 Examples of Arthropoda : |
| kebo104 | 4 | 4.13 | 8 | 276.0x653.9 | `VALID` | Figure 4.13 Examples of Mollusca : |
| kebo104 | 4 | 4.14 | 9 | 276.0x176.0 | `VALID` | Figure 4.14 Examples of |
| kebo104 | 4 | 4.15 | 9 | 276.0x67.1 | `VALID` | Figure 4.15 Balanoglossus |
| kebo104 | 4 | 4.16 | 10 | 276.0x180.2 | `VALID` | Figure 4.16  Chordata characteristics |
| kebo104 | 4 | 4.17 | 10 | 276.0x280.7 | `VALID` | Figure 4.17  Ascidia |
| kebo104 | 4 | 4.18 | 11 | 276.0x361.8 | `VALID` | Figure 4.18 A jawless vertebrate - Petromyzon |
| kebo104 | 4 | 4.19 | 11 | 276.0x582.4 | `VALID` | Figure 4.19 Example of Cartilaginous fishes : |
| kebo104 | 4 | 4.21 | 12 | 276.0x195.5 | `VALID` | Figure 4.21 Examples of Amphibia : |
| kebo104 | 4 | 4.20 | 12 | 276.0x120.6 | `VALID` | Figure 4.20 Examples of Bony fishes : |
| kebo104 | 4 | 4.22 | 13 | 506.0x265.1 | `VALID` | Figure 4.22  Reptiles: (a) Chameleon (b) Crocodilu |
| kebo104 | 4 | 4.23 | 14 | 506.0x263.4 | `VALID` | Figure 4.23  Some birds : (a) Neophron  (b) Struth |
| kebo104 | 4 | 4.24 | 14 | 506.0x199.1 | `VALID` | Figure 4.24 Some mammals : (a) Ornithorhynchus (b) |
