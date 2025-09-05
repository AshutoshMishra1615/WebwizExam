import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import URDFLoader from "urdf-loader";

const URDFViewer = forwardRef(({ urdfContent }, ref) => {
  const mountRef = useRef();
  const [joints, setJoints] = useState([]);
  const robotRef = useRef(null);

  useImperativeHandle(ref, () => ({
    getRobot: () => robotRef.current,
  }));

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    const camera = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      100
    );
    camera.position.set(2, 2, 3);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight
    );
    mountRef.current.innerHTML = "";
    mountRef.current.appendChild(renderer.domElement);

    // Lights
    const light1 = new THREE.DirectionalLight(0xffffff, 1);
    light1.position.set(5, 5, 5);
    scene.add(light1);
    scene.add(new THREE.AmbientLight(0x404040));

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);

    // URDF Loader
    const loader = new URDFLoader();
    loader.loadMeshCb = loader.defaultMeshLoader; // ensure meshes load

    let robot;
    try {
      robot = loader.parse(urdfContent, {
        packages: "",
        workingPath: "",
      });
      robotRef.current = robot;
      scene.add(robot);

      // collect joints
      const jointList = [];
      Object.keys(robot.joints).forEach((name) => {
        const j = robot.joints[name];
        if (typeof j.setJointValue === "function") {
          jointList.push({ name, joint: j, value: 0 });
        }
      });
      setJoints(jointList);
    } catch (err) {
      console.error("URDF Parse Error:", err);
    }

    // Animate
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      if (renderer) {
        renderer.dispose();
      }
    };
  }, [urdfContent]);

  // Joint change handler
  const handleJointChange = (index, newValue) => {
    const updated = [...joints];
    updated[index].value = newValue;
    setJoints(updated);

    if (
      updated[index].joint &&
      typeof updated[index].joint.setJointValue === "function"
    ) {
      updated[index].joint.setJointValue(newValue);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* 3D Viewer */}
      <div ref={mountRef} className="flex-1 rounded-lg overflow-hidden" />

      {/* Joints Control */}
      {joints.length > 0 && (
        <div className="bg-gray-800 p-3 mt-2 rounded-lg max-h-48 overflow-y-auto">
          <h3 className="text-sm font-semibold mb-2 text-gray-200">
            Joint Controls
          </h3>
          {joints.map((j, idx) => (
            <div key={j.name} className="mb-2">
              <label className="text-gray-300 text-xs">{j.name}</label>
              <input
                type="range"
                min={-3.14}
                max={3.14}
                step={0.01}
                value={j.value}
                onChange={(e) =>
                  handleJointChange(idx, parseFloat(e.target.value))
                }
                className="w-full accent-blue-500"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default URDFViewer;
