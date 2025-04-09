# GYTHM
A gyroscope 2-rail rhythm game

[Play GYTHM](https://seanangle666.github.io/GYTHM/index.html)

---

## Notation of the Chart

### 1. Metadata
Use the format:  
`&property = value`

---

### 2. Mark out & Annotation

- Use `()` to **mark out** what you want. The decoder will ignore it.  
  Example: `(240#)`

- Use `||` for **annotations**.  
  Example: `|decoder will ignore the text in double pipe|`

---

### 3. Charting

- Use characters `0` to `F` to represent the **position of the notes** on the track, and separate the notes with commas.  
  Example: `1,2,3,4,`

- For multiple notes at the same time, use `*` to separate them.  
  Example: `2*4`

- Some notes require additional **details**. To add details, use `< >`.  
  Example: `1h<4:1>` represents a hold with duration.

- If you need to add more properties for the note, you can use `<property = value>`.  
  Example: for a crash note, use: `0c<face = L>`

---

### Example
- A **hold note**:  
  `1h<4:1>`  
  (This represents a hold on position 1, with a duration of 4/1.)

- A **crash note** with properties:  
  `0c<face = L>`  
  (This represents a crash note at position 0, with the property `face = L`.)

---
