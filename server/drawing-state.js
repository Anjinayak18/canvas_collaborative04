class DrawingState {
  constructor() {
    this.strokes = [];
    this.undone = new Set();
  }

  addStroke(stroke) {
    this.strokes.push(stroke);
  }

  undoLast() {
    for (let i = this.strokes.length - 1; i >= 0; i--) {
      const s = this.strokes[i];
      if (!this.undone.has(s.id)) {
        this.undone.add(s.id);
        return s.id;
      }
    }
    return null;
  }

  redoLast() {
    const last = [...this.undone].pop();
    if (last) {
      this.undone.delete(last);
      return last;
    }
    return null;
  }

  getState() {
    return {
      strokes: this.strokes,
      undone: [...this.undone]
    };
  }
}

module.exports = DrawingState;
