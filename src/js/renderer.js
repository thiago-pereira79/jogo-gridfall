import { ARENA_COLUMNS, ARENA_ROWS } from "./game.js";
import { EMPTY_CELL, PIECE_COLORS, getMatrixBounds } from "./pieces.js";

const BOARD_BACKGROUND = "#10141d";
const GRID_COLOR = "rgba(156, 170, 199, 0.12)";
const GHOST_COLOR = "rgba(220, 227, 245, 0.32)";
const PREVIEW_BACKGROUND = "rgba(255, 255, 255, 0.02)";

export class GridfallRenderer {
  constructor({ boardCanvas, nextCanvas }) {
    this.boardCanvas = boardCanvas;
    this.boardContext = boardCanvas.getContext("2d");
    this.nextCanvas = nextCanvas;
    this.nextContext = nextCanvas.getContext("2d");
    this.theme = {
      accent: "#8b5cf6",
      boardBackground: BOARD_BACKGROUND,
      grid: GRID_COLOR,
      ghost: GHOST_COLOR,
      previewBackground: PREVIEW_BACKGROUND,
    };
  }

  setTheme(theme = {}) {
    this.theme = {
      accent: theme.accent ?? this.theme.accent,
      boardBackground: theme.surface ?? theme.background ?? BOARD_BACKGROUND,
      grid: theme.grid ?? GRID_COLOR,
      ghost: theme.ghost ?? GHOST_COLOR,
      previewBackground: theme.surfaceSecondary ?? PREVIEW_BACKGROUND,
    };
  }

  resize() {
    this.syncCanvasSize(this.boardCanvas, this.boardContext);
    this.syncCanvasSize(this.nextCanvas, this.nextContext);
  }

  render(snapshot) {
    this.resize();
    this.renderBoard(snapshot);
    this.renderNextPiece(snapshot.nextPiece);
  }

  syncCanvasSize(canvas, context) {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(rect.width * dpr));
    const height = Math.max(1, Math.round(rect.height * dpr));

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  renderBoard(snapshot) {
    const ctx = this.boardContext;
    const width = this.boardCanvas.clientWidth;
    const height = this.boardCanvas.clientHeight;
    const cellSize = Math.min(width / ARENA_COLUMNS, height / ARENA_ROWS);
    const boardWidth = cellSize * ARENA_COLUMNS;
    const boardHeight = cellSize * ARENA_ROWS;
    const offsetX = (width - boardWidth) / 2;
    const offsetY = (height - boardHeight) / 2;

    const boardBackground = this.theme.boardBackground;
    const gridColor = this.theme.grid;
    const ghostColor = this.theme.ghost;
    const accentColor = this.theme.accent;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = boardBackground;
    ctx.fillRect(offsetX, offsetY, boardWidth, boardHeight);

    this.drawGrid(ctx, offsetX, offsetY, boardWidth, boardHeight, cellSize, gridColor);
    this.drawArena(ctx, snapshot.arena, offsetX, offsetY, cellSize);
    this.drawGhost(ctx, snapshot, offsetX, offsetY, cellSize, ghostColor);

    if (snapshot.currentPiece) {
      this.drawMatrix(ctx, snapshot.currentPiece.matrix, snapshot.position, offsetX, offsetY, cellSize);
    }

    this.drawLineClearEffect(ctx, snapshot.lineClearEffect, offsetX, offsetY, boardWidth, cellSize, accentColor);
  }

  renderNextPiece(nextPiece) {
    const ctx = this.nextContext;
    const width = this.nextCanvas.clientWidth;
    const height = this.nextCanvas.clientHeight;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = this.theme.previewBackground;
    ctx.fillRect(0, 0, width, height);

    if (!nextPiece) {
      return;
    }

    const bounds = getMatrixBounds(nextPiece.matrix);

    if (!bounds) {
      return;
    }

    const padding = Math.max(12, Math.min(width, height) * 0.14);
    const cellSize = Math.floor(
      Math.min((width - padding * 2) / bounds.width, (height - padding * 2) / bounds.height),
    );
    const pieceWidth = bounds.width * cellSize;
    const pieceHeight = bounds.height * cellSize;
    const offsetX = (width - pieceWidth) / 2 - bounds.minX * cellSize;
    const offsetY = (height - pieceHeight) / 2 - bounds.minY * cellSize;

    this.drawMatrix(ctx, nextPiece.matrix, { x: 0, y: 0 }, offsetX, offsetY, cellSize);
  }

  drawGrid(ctx, offsetX, offsetY, boardWidth, boardHeight, cellSize, gridColor) {
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    ctx.beginPath();

    for (let x = 0; x <= ARENA_COLUMNS; x += 1) {
      const lineX = offsetX + x * cellSize;
      ctx.moveTo(lineX, offsetY);
      ctx.lineTo(lineX, offsetY + boardHeight);
    }

    for (let y = 0; y <= ARENA_ROWS; y += 1) {
      const lineY = offsetY + y * cellSize;
      ctx.moveTo(offsetX, lineY);
      ctx.lineTo(offsetX + boardWidth, lineY);
    }

    ctx.stroke();
  }

  drawArena(ctx, arena, offsetX, offsetY, cellSize) {
    for (let y = 0; y < arena.length; y += 1) {
      for (let x = 0; x < arena[y].length; x += 1) {
        const value = arena[y][x];

        if (value !== EMPTY_CELL) {
          this.drawBlock(ctx, x, y, value, offsetX, offsetY, cellSize);
        }
      }
    }
  }

  drawMatrix(ctx, matrix, position, offsetX, offsetY, cellSize) {
    for (let y = 0; y < matrix.length; y += 1) {
      for (let x = 0; x < matrix[y].length; x += 1) {
        const value = matrix[y][x];

        if (value === EMPTY_CELL) {
          continue;
        }

        const boardX = position.x + x;
        const boardY = position.y + y;

        if (boardY < 0) {
          continue;
        }

        this.drawBlock(ctx, boardX, boardY, value, offsetX, offsetY, cellSize);
      }
    }
  }

  drawGhost(ctx, snapshot, offsetX, offsetY, cellSize, ghostColor) {
    if (!snapshot.currentPiece || !snapshot.ghostPosition || snapshot.ghostPosition.y === snapshot.position.y) {
      return;
    }

    const matrix = snapshot.currentPiece.matrix;
    const gap = Math.max(1, cellSize * 0.1);

    ctx.save();
    ctx.strokeStyle = ghostColor;
    ctx.lineWidth = Math.max(1.5, cellSize * 0.06);

    for (let y = 0; y < matrix.length; y += 1) {
      for (let x = 0; x < matrix[y].length; x += 1) {
        if (matrix[y][x] === EMPTY_CELL) {
          continue;
        }

        const boardX = snapshot.ghostPosition.x + x;
        const boardY = snapshot.ghostPosition.y + y;

        if (boardY < 0) {
          continue;
        }

        const rectX = offsetX + boardX * cellSize + gap;
        const rectY = offsetY + boardY * cellSize + gap;
        const rectSize = Math.max(1, cellSize - gap * 2);

        this.roundRect(ctx, rectX, rectY, rectSize, rectSize, cellSize * 0.12);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  drawBlock(ctx, boardX, boardY, value, offsetX, offsetY, cellSize) {
    const color = PIECE_COLORS[value] ?? { fill: "#f8fafc", stroke: "#94a3b8" };
    const gap = Math.max(1, cellSize * 0.055);
    const x = offsetX + boardX * cellSize + gap;
    const y = offsetY + boardY * cellSize + gap;
    const size = Math.max(1, cellSize - gap * 2);
    const radius = Math.max(2, cellSize * 0.11);

    ctx.save();
    this.roundRect(ctx, x, y, size, size, radius);
    ctx.fillStyle = color.fill;
    ctx.fill();
    ctx.strokeStyle = color.stroke;
    ctx.lineWidth = Math.max(1, cellSize * 0.045);
    ctx.stroke();

    ctx.globalAlpha = 0.18;
    ctx.fillStyle = "#ffffff";
    this.roundRect(ctx, x + size * 0.14, y + size * 0.12, size * 0.72, size * 0.18, radius * 0.6);
    ctx.fill();
    ctx.restore();
  }

  drawLineClearEffect(ctx, effect, offsetX, offsetY, boardWidth, cellSize, accentColor) {
    if (!effect) {
      return;
    }

    const progress = Math.min(1, effect.age / effect.duration);
    const alpha = 0.34 * (1 - progress);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = accentColor;

    for (const row of effect.rows) {
      ctx.fillRect(offsetX, offsetY + row * cellSize, boardWidth, cellSize);
    }

    ctx.globalAlpha = 0.28 * (1 - progress);
    ctx.fillStyle = accentColor;

    for (const row of effect.rows) {
      const rowY = offsetY + row * cellSize;
      const particleCount = 12;

      for (let index = 0; index < particleCount; index += 1) {
        const spread = (index + 0.5) / particleCount;
        const x = offsetX + spread * boardWidth;
        const y = rowY + cellSize * (0.5 + Math.sin(index * 1.7) * 0.18) - progress * cellSize * 0.55;
        const size = Math.max(1.5, cellSize * 0.08);
        ctx.fillRect(x, y, size, size);
      }
    }

    ctx.restore();
  }

  roundRect(ctx, x, y, width, height, radius) {
    const safeRadius = Math.min(radius, width / 2, height / 2);

    ctx.beginPath();
    ctx.moveTo(x + safeRadius, y);
    ctx.lineTo(x + width - safeRadius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
    ctx.lineTo(x + width, y + height - safeRadius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
    ctx.lineTo(x + safeRadius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
    ctx.lineTo(x, y + safeRadius);
    ctx.quadraticCurveTo(x, y, x + safeRadius, y);
    ctx.closePath();
  }
}
