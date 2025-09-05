import { useState } from "react";
import Editor from "@monaco-editor/react";
import URDFViewer from "./components/URDFViewer";
import { generateURDF } from "./api/gemini";

function App() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [urdf, setUrdf] = useState(`<?xml version="1.0"?>
<robot name="simple_bot">
  <link name="base_link">
    <visual>
      <geometry>
        <box size="1 1 0.2"/>
      </geometry>
      <origin xyz="0 0 0" rpy="0 0 0"/>
      <material name="blue">
        <color rgba="0 0 1 1"/>
      </material>
    </visual>
  </link>
</robot>`);
  const [availableJoints, setAvailableJoints] = useState([]);

  const handleDownload = () => {
    const blob = new Blob([urdf], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "robot.urdf";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAI = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      const urdfCode = await generateURDF(prompt);
      setUrdf(urdfCode);
    } catch (err) {
      console.error("AI generation failed:", err);
      alert("Failed to generate URDF. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 flex flex-col">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 py-4 px-6 flex justify-between items-center shadow-lg">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          🤖 URDF Builder
        </h1>
        <button
          onClick={handleDownload}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition text-white font-medium shadow"
        >
          ⬇ Download URDF
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col lg:flex-row p-6 gap-6">
        {/* Left: Editor + AI Generator */}
        <div className="flex flex-col w-full lg:w-1/2 space-y-6">
          {/* AI Generator */}
          <section className="bg-gray-900 border border-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-3 text-white">
              AI Generator
            </h2>
            <div className="flex space-x-3">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your robot (e.g., 2-wheeled robot with lidar)"
                className="flex-grow p-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-200"
              />
              <button
                onClick={handleAI}
                disabled={loading}
                className={`px-5 py-3 rounded-lg text-white font-medium transition shadow ${
                  loading
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-500"
                }`}
              >
                {loading ? "Generating..." : "Generate"}
              </button>
            </div>
          </section>

          {/* Monaco Editor */}
          <section className="flex-grow bg-gray-900 border border-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-3 text-white">Edit URDF</h2>
            <div className="w-full h-[450px] border border-gray-700 rounded-lg overflow-hidden">
              <Editor
                height="100%"
                defaultLanguage="xml"
                value={urdf}
                onChange={(val) => setUrdf(val || "")}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: "on",
                }}
              />
            </div>
          </section>
        </div>

        {/* Right: Visualization + Joints */}
        <div className="flex flex-col w-full lg:w-1/2 space-y-6">
          {/* URDF Viewer */}
          <section className="flex-grow bg-gray-900 border border-gray-800 rounded-2xl shadow-lg p-4">
            <h2 className="text-lg font-semibold mb-3 text-white">
              Visualization
            </h2>
            <div className="w-full h-[500px] rounded-lg overflow-hidden border border-gray-700">
              <URDFViewer
                urdfContent={urdf}
                setAvailableJoints={setAvailableJoints}
              />
            </div>
          </section>

          {/* Joint Controls */}
          {availableJoints.length > 0 && (
            <section className="bg-gray-900 border border-gray-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-semibold mb-3 text-white">
                Joint Controls
              </h2>
              <div className="space-y-4 max-h-60 overflow-y-auto">
                {availableJoints.map(({ name, joint }) => (
                  <div key={name}>
                    <label className="block font-medium mb-1 text-gray-300">
                      {name}
                    </label>
                    <input
                      type="range"
                      min={-3.14}
                      max={3.14}
                      step={0.01}
                      defaultValue={0}
                      onChange={(e) => {
                        if (typeof joint.setJointValue === "function") {
                          joint.setJointValue(parseFloat(e.target.value));
                        }
                      }}
                      className="w-full accent-blue-600"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-3 text-center text-gray-500 text-sm">
        URDF Builder © 2025 | Built with React + Three.js + Gemini
      </footer>
    </div>
  );
}

export default App;
