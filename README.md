# MothDrone: 3D Mission  Interface

This branch contains the advanced **3D Visualization Suite** for the MothDrone project, developed as a high-fidelity "Mission Control" center. It provides real-time monitoring of VTOL interception maneuvers using a modern web-based stack.

## 🛠 Tech Stack
* **Framework:** Next.js 14 (App Router)
* **Rendering:** Three.js / React Three Fiber
* **Styling:** Tailwind CSS / Shadcn UI
* **Package Manager:** `pnpm`

---

## 🚀 Installation & Setup

Follow these steps to get the 3D dashboard running on your local machine:

### 1. Prerequisites
Ensure you have **Node.js (v18+)** installed. Then, install **pnpm** globally:
```bash
npm install -g pnpm

2. Install Dependencies
Navigate to the project root and run:

Bash
pnpm install
3. Run Development Server
Start the interface in development mode:

Bash
pnpm dev
Open http://localhost:3000 in your browser to view the dashboard.

🎮 Key Features
📡 Real-time Telemetry Visualizer
The interface connects to the MothDrone SITL telemetry stream to display live flight data:

Attitude Indicators: Pitch, Roll, and Yaw monitoring for the VTOL airframe.

Mission Metrics: Live tracking of Altitude, Ground Speed, and Battery status.

Interception Range: Dynamic distance calculation between the Hunter and Target drones.

⚡ HPM Pulse Visualizer
Custom-built shader effects designed to visualize the High-Power Microwave (HPM) pulse deployment. When the interception trigger is activated, the UI renders the pulse radius and electronic suppression field.

🌍 3D Trajectory Mapping
A persistent 3D path tracer that draws the real-time flight history of both drones, allowing for precise post-mission analysis of the interception geometry.

🔗 Connection to SITL
For the dashboard to display live data, ensure that your PX4 SITL and the Python Telemetry Bridge are running in the background. The frontend consumes a JSON stream from the local telemetry server to update the 3D scene every 0.5 seconds.

⚠️ Note
This branch is dedicated to the Frontend Visualizer. For the core PX4 control logic, Gazebo worlds, and SITL scripts, please switch back to the main branch.
