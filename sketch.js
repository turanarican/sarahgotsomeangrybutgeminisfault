let elementsData;
let hoveredElement = null;
let elements = []; // Array to hold Element objects

// --- Layout and Styling ---
const GRID_COLS = 18;
const GRID_ROWS_MAIN = 7; // Main table rows (Periods 1-7)
const GRID_ROWS_LOWER = 2; // Lanthanides/Actinides block
const LOWER_BLOCK_Y_START = 9; // The ypos value in JSON for the lower block start (typically 8 for L, 9 for A)
const LOWER_BLOCK_SCREEN_ROW_OFFSET = 2; // Number of rows to offset the lower block visually

let cellSize = 50;
let marginX, marginY; // Calculated margins for centering
let tableWidth, tableHeight;

// --- Colors ---
let categoryColors;

// --- Animation ---
let atomCenterX, atomCenterY;
let atomRadius = 150; // Max radius for the outermost orbit
let electronSize = 6;
let nucleusSize = 15;
let orbitColor;
let electronColor;
let nucleusColor;

// --- Info Box ---
let infoBoxX, infoBoxY, infoBoxW, infoBoxH;

// --- Preload ---
function preload() {
  // Ensure the path 'elements.json' is correct relative to index.html
  elementsData = loadJSON("elements.json");
}

// --- Setup ---
function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont("sans-serif");

  // Calculate cell size and margins based on window size
  // We need space for the main table + the lower block
  let totalGridRowsVisual =
    GRID_ROWS_MAIN + LOWER_BLOCK_SCREEN_ROW_OFFSET + GRID_ROWS_LOWER; // Total visual rows including gap

  // Attempt to size based on width first
  cellSize = floor((windowWidth * 0.9) / GRID_COLS);
  // If too tall, resize based on height
  if (totalGridRowsVisual * cellSize > windowHeight * 0.85) {
    cellSize = floor((windowHeight * 0.85) / totalGridRowsVisual);
  }
  // Minimum cell size to keep it usable
  cellSize = max(30, cellSize);

  tableWidth = GRID_COLS * cellSize;
  tableHeight = GRID_ROWS_MAIN * cellSize;
  let lowerBlockHeight = GRID_ROWS_LOWER * cellSize;

  marginX = (windowWidth - tableWidth) / 2;
  marginY = 50; // Top margin for title/info

  // Define element colors (expand this with all categories from your JSON!)
  categoryColors = {
    "diatomic nonmetal": color(120, 220, 120, 200), // Light green
    "noble gas": color(180, 160, 255, 200), // Light purple
    "alkali metal": color(255, 150, 100, 200), // Orange
    "alkaline earth metal": color(255, 220, 100, 200), // Yellow
    metalloid: color(100, 200, 200, 200), // Teal
    "polyatomic nonmetal": color(140, 230, 140, 200), // Brighter green
    lanthanide: color(255, 180, 200, 200), // Pink
    actinide: color(230, 160, 220, 200), // Magenta
    "transition metal": color(220, 180, 180, 200), // Light red/pink
    "post-transition metal": color(180, 180, 180, 200), // Grey
    unknown: color(230, 230, 230, 200), // Light Grey
    default: color(200, 200, 200, 180), // Default Grey if category not found
  };

  orbitColor = color(100, 100, 100, 150);
  electronColor = color(0, 0, 255); // Blue electrons
  nucleusColor = color(255, 0, 0); // Red nucleus

  // Create Element objects from JSON data
  elements = []; // Clear previous elements on resize
  if (elementsData && elementsData.elements) {
    elementsData.elements.forEach((data) => {
      elements.push(new Element(data));
    });
  } else {
    console.error("Failed to load or parse elements.json");
    // Draw error message on screen
    createP(
      "Error: Could not load element data from elements.json. Make sure 'elements.json' exists in the same folder and is valid JSON."
    ).position(20, 20);
  }

  // Define positions for info box and atom animation
  infoBoxW = min(300, windowWidth * 0.4); // Max width
  infoBoxH = 200;
  let spacing = 20;

  // Place info box and atom side-by-side if space allows
  if (windowWidth > tableWidth + infoBoxW + atomRadius * 2 + spacing * 4) {
    // Wide screen: Place info box and atom to the right of the table
    infoBoxX = marginX + tableWidth + spacing;
    infoBoxY = marginY;

    atomCenterX = infoBoxX + infoBoxW / 2; // Center atom below info box
    atomCenterY = infoBoxY + infoBoxH + spacing + atomRadius;
    // Alternative: Place atom side-by-side with info box
    // atomCenterX = infoBoxX + infoBoxW + spacing + atomRadius;
    // atomCenterY = marginY + tableHeight / 2;
  } else {
    // Narrow screen: Place info box and atom below the table
    infoBoxX = marginX + tableWidth - infoBoxW; // Right-aligned below table
    infoBoxY =
      marginY +
      tableHeight +
      lowerBlockHeight +
      spacing +
      LOWER_BLOCK_SCREEN_ROW_OFFSET * cellSize;

    atomCenterX = marginX + tableWidth / 2; // Centered horizontally
    atomCenterY = infoBoxY + infoBoxH + spacing + atomRadius;
  }

  // Ensure info box doesn't go off screen right
  infoBoxX = min(infoBoxX, windowWidth - infoBoxW - spacing);
  // Ensure info box doesn't go off screen left
  infoBoxX = max(infoBoxX, spacing);
  // Ensure atom doesn't go off screen
  atomCenterX = max(atomCenterX, atomRadius + spacing);
  atomCenterX = min(atomCenterX, windowWidth - atomRadius - spacing);
  atomCenterY = max(atomCenterY, atomRadius + spacing);
  atomCenterY = min(atomCenterY, windowHeight - atomRadius - spacing);
}

// --- Draw Loop ---
function draw() {
  background(250);
  hoveredElement = null; // Reset hover state each frame

  // --- Draw Title ---
  fill(0);
  textSize(28);
  textAlign(CENTER, TOP);
  text("Dynamic Periodic Table", windowWidth / 2, 10);

  // --- Draw Elements and Detect Hover ---
  elements.forEach((element) => {
    element.draw();
    if (element.isHovered(mouseX, mouseY)) {
      hoveredElement = element;
    }
  });

  // --- Draw Hover Highlight (drawn after all elements so it's on top) ---
  if (hoveredElement) {
    hoveredElement.highlight();
  }

  // --- Display Info Box and Atom Animation ---
  if (hoveredElement) {
    displayElementInfo(hoveredElement);
    drawAtom(hoveredElement);
  } else {
    // Optional: Display default text when nothing is hovered
    fill(150);
    textSize(16);
    textAlign(LEFT, TOP);
    // Adjust default text position based on infoBox location
    text(
      "Hover over an element\nto see details and atom structure",
      infoBoxX + 10,
      infoBoxY + 10
    );

    // Optional: Draw a generic atom placeholder?
    // fill(200); noStroke();
    // ellipse(atomCenterX, atomCenterY, nucleusSize * 0.8, nucleusSize * 0.8);
  }
}

// --- Window Resized ---
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // Recalculate layout on resize
  setup(); // Re-run setup to recalculate sizes and positions
}

// --- Element Class ---
class Element {
  constructor(data) {
    this.data = data; // Store all JSON data

    // Calculate grid position, adjusting ypos for the lower block
    let visualYpos = data.ypos;
    if (data.ypos >= LOWER_BLOCK_Y_START) {
      visualYpos =
        GRID_ROWS_MAIN +
        LOWER_BLOCK_SCREEN_ROW_OFFSET +
        (data.ypos - LOWER_BLOCK_Y_START);
    }

    this.x = marginX + (data.xpos - 1) * cellSize;
    this.y = marginY + (visualYpos - 1) * cellSize;
    this.size = cellSize;
    this.color = categoryColors[data.category] || categoryColors["default"];
  }

  draw() {
    // Element Box
    fill(this.color);
    stroke(50);
    strokeWeight(1);
    rect(this.x, this.y, this.size, this.size, 4); // Slightly rounded corners

    // Text
    fill(0); // Black text

    // Adjust text size based on cell size
    let symbolSize = this.size * 0.4;
    let numberSize = this.size * 0.2;
    let nameSize = this.size * 0.15;

    // Draw Atomic Number (Top Left)
    textSize(numberSize);
    textAlign(LEFT, TOP);
    text(
      this.data.number,
      this.x + this.size * 0.05,
      this.y + this.size * 0.05
    );

    // Draw Symbol (Center)
    textSize(symbolSize);
    textAlign(CENTER, CENTER);
    // Adjust symbol size for long symbols if needed (e.g., Uuq)
    if (this.data.symbol.length > 2) textSize(symbolSize * 0.8);
    text(
      this.data.symbol,
      this.x + this.size / 2,
      this.y + this.size / 2 + this.size * 0.05
    ); // Slight vertical adjustment

    // Draw Name (Bottom Center)
    textSize(nameSize);
    textAlign(CENTER, BOTTOM);
    // Only draw name if cell is large enough
    if (this.size > 40) {
      text(this.data.name, this.x + this.size / 2, this.y + this.size * 0.95);
    }
  }

  isHovered(mx, my) {
    return (
      mx > this.x &&
      mx < this.x + this.size &&
      my > this.y &&
      my < this.y + this.size
    );
  }

  highlight() {
    // Draw a thicker border or a glow effect
    noFill();
    stroke(0, 0, 255, 180); // Blue highlight
    strokeWeight(3);
    rect(this.x - 1, this.y - 1, this.size + 2, this.size + 2, 5);
  }
}

// --- Display Info Function ---
function displayElementInfo(element) {
  // Draw info box background
  fill(255, 255, 255, 220); // Semi-transparent white
  stroke(50);
  strokeWeight(1);
  rect(infoBoxX, infoBoxY, infoBoxW, infoBoxH, 8); // Rounded corners

  // Display text
  fill(0); // Black text
  textAlign(LEFT, TOP);
  let txtSize = 14;
  let spacing = txtSize * 1.5;
  let currentY = infoBoxY + 15;
  let currentX = infoBoxX + 15;

  textSize(txtSize + 4); // Larger for name/symbol
  textStyle(BOLD);
  text(
    `${element.data.number}. ${element.data.name} (${element.data.symbol})`,
    currentX,
    currentY
  );
  textStyle(NORMAL);
  currentY += spacing * 1.4; // More space after title

  textSize(txtSize);
  if (element.data.atomic_mass) {
    // Check if mass data exists
    text(
      `Atomic Mass: ${parseFloat(element.data.atomic_mass).toFixed(3)} u`,
      currentX,
      currentY
    );
    currentY += spacing;
  } else {
    text(`Atomic Mass: Unknown`, currentX, currentY);
    currentY += spacing;
  }

  if (element.data.category) {
    text(`Category: ${element.data.category}`, currentX, currentY);
    currentY += spacing;
  } else {
    text(`Category: Unknown`, currentX, currentY);
    currentY += spacing;
  }

  text(`Electron Config:`, currentX, currentY);
  currentY += spacing * 0.9;
  textSize(txtSize * 0.9); // Smaller for config
  if (element.data.electron_configuration_semantic) {
    text(
      `${element.data.electron_configuration_semantic}`,
      currentX + 5,
      currentY
    );
  } else {
    text(`Unknown`, currentX + 5, currentY);
  }

  currentY += spacing;

  if (element.data.shells && element.data.shells.length > 0) {
    textSize(txtSize * 0.9); // Smaller for shell config
    text(`Shells: ${element.data.shells.join(", ")}`, currentX + 5, currentY);
  } else {
    textSize(txtSize * 0.9);
    text(`Shells: Unknown`, currentX + 5, currentY);
  }
}

// --- Draw Atom Animation ---
function drawAtom(element) {
  push(); // Isolate transformations and styles

  translate(atomCenterX, atomCenterY);

  // Draw Nucleus
  fill(nucleusColor);
  noStroke();
  ellipse(0, 0, nucleusSize, nucleusSize);
  // Optional: Text inside nucleus (atomic number or symbol)
  fill(255); // White text for nucleus
  textSize(nucleusSize * 0.6);
  textAlign(CENTER, CENTER);
  text(element.data.symbol, 0, 1); // Slight Y offset often looks better centered visually

  // Draw Orbits and Electrons
  let shells = element.data.shells;
  if (!shells || shells.length === 0) {
    // Draw a simple nucleus with no shells if data is missing/empty
    textSize(12);
    fill(50);
    textAlign(CENTER, TOP);
    text("No shell data", 0, nucleusSize / 2 + 5);
    pop();
    return; // Exit the function
  }

  // Calculate spacing between orbits - adjust the multiplier for tighter/looser packing
  let orbitSpacing = (atomRadius - nucleusSize / 2) / shells.length;
  orbitSpacing = max(orbitSpacing, electronSize * 2.5); // Minimum spacing

  for (let i = 0; i < shells.length; i++) {
    let numElectrons = shells[i];
    if (numElectrons === 0) continue; // Skip shells with no electrons

    let shellRadius = nucleusSize / 2 + (i + 1) * orbitSpacing; // Radius for this orbit

    // Draw Orbit Path
    noFill();
    stroke(orbitColor);
    strokeWeight(1);
    ellipse(0, 0, shellRadius * 2, shellRadius * 2);

    // Calculate electron positions
    fill(electronColor);
    noStroke();
    // Animation speed: Faster for inner shells, slower for outer
    // frameCount controls the overall rotation, multiplier controls relative speed
    let animationSpeed = map(i, 0, shells.length - 1, 0.02, 0.005); // Faster inner, slower outer
    let baseAngle = (frameCount * animationSpeed) % TWO_PI;
    let angleIncrement = TWO_PI / numElectrons;

    for (let j = 0; j < numElectrons; j++) {
      let angle = baseAngle + j * angleIncrement;
      let ex = shellRadius * cos(angle);
      let ey = shellRadius * sin(angle);
      ellipse(ex, ey, electronSize, electronSize);
    }
  }

  pop(); // Restore previous drawing state
}
