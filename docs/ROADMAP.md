#  Horse Racing Game – Front-End Case Study Roadmap


## Goal
Build an interactive web application using Vue.js where users can generate a 6-round horse racing program, start the races, and view animated results for each round.

---

## Project Objectives
- Generate a pool of up to 20 horses, each with a unique color and condition score  
- Create a 6-round race program (distances: 1200–2200 meters)  
- Randomly select 10 horses for each round  
- Run races sequentially when the user clicks **Start**  
- Display results round by round in the **Results** panel  
- Animate horses visually on the racetrack  
- Ensure clean, scalable code architecture using Vuex  
- *(Optional)* Add Unit and E2E tests

---

## Development Roadmap

### **Phase 1 — Project Setup**
- [ ] Initialize Vue 3 + Vite project  
- [ ] Configure Vuex integration  
- [ ] Create base folder structure
- [ ] Establish pragmatic atomic component folders (atoms, molecules, organisms, views) without over-abstracting  
- [ ] Set up SCSS or plain CSS styling  
- [ ] Initialize Git repository and create a `README.md` with basic commands

---

### **Phase 2 — Data Modeling & Vuex Store**
- [ ] Define `Horse`, `Round`, and `Result` data types (`/types/`)  
- [ ] Create Vuex modules:
- `horses` → Generates the 20-horse pool  
- `race` → Manages race program, rounds, and results  
- [ ] Persist `roundAssignments` (10 horses per round) for the Program panel display  
- [ ] On **Generate** click:
- Create a pool of 20 horses  
- Ensure each horse receives a unique color (validate on re-generate)  
- Build 6 rounds with distances: 1200, 1400, 1600, 1800, 2000, 2200  
- Randomly assign 10 horses per round  
- Reset previous race state (results, timers, current round index)  
- Save all to Vuex store

---

### **Phase 3 — UI Layout**
- [ ] Main view: `GameView.vue` orchestrates three-column layout  
- [ ] Left column: `HorseListPanel.vue` (1–20 horse roster)  
- [ ] Center: `RaceTrack.vue` (animated horses + active round banner)  
- [ ] Right column: `ProgramPanel.vue` (round schedule) and `ResultsPanel.vue` (round results)  
- [ ] Controls: `Controls.vue` (Generate / Start / Pause / Reset)  
- [ ] Shared atoms/molecules (e.g., `HorseBadge`, `RoundRow`) kept lightweight

---

### **Phase 4 — Race Simulation & Animation**
- [ ] When **Start** is clicked:
- Trigger rounds sequentially from Vuex  
- Animate 10 horses per round on the track  
- [ ] Implement `requestAnimationFrame` loop for smooth animation  
- [ ] Speed model:
- `speed = baseSpeed * (1 + conditionFactor + randomJitter)`  
- Adjust total time based on distance  
- [ ] Support Start/Pause toggle via Vuex flag (resume animation, preserve progress)  
- [ ] On round finish:
- Push results to Vuex  
- Update `ResultsPanel`  
- Automatically trigger the next round  
- [ ] When all 6 rounds are complete → status becomes `finished`

---

### **Phase 5 — Results & Visualization**
- [ ] Display rankings for each round in a table format  
- [ ] Highlight the winner (e.g., gold color)  
- [ ] Append cumulative results as rounds progress  
- [ ] Keep `ProgramPanel` pinned to store `roundAssignments` and current round indicator  
- [ ] Optimize rendering with CSS transforms for performance

---

### **Phase 6 — Testing (Optional )**
- [ ] **Unit Tests (Vitest)**  
- Test `rng.ts`, `generateRounds`, `computeResults`  
- Test Vuex store actions and mutations  
- Component-level tests for `Controls`, `HorseListPanel`, and `RaceTrack` interactions  
- [ ] **E2E Tests (Cypress)**  
- Verify the full “Generate → Start → Results” flow  
- Check button states (enabled/disabled transitions, pause/resume flow)

---

### **Phase 7 — Final Touches & Delivery**
- [ ] Complete `README.md` with installation and usage instructions  
- [ ] Code formatting (ESLint + Prettier)  
- [ ] Ensure responsive design  
- [ ] Publish public GitHub repository

---

##  Additional 
- Use a **seeded RNG** for repeatable race outcomes  
- Make condition visibly affect speed (low condition → slower horse)  
- Add a short “ready” animation before each round (optional)  
- Keep UI clean, modern, and visually balanced
- Maintain atomic structure pragmatically—promote reuse without adding unneeded abstraction

---



