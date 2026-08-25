'use client';

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

export const DroneCanvas3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 240;
    const height = container.clientHeight || 320;

    // 1. Scene setup
    const scene = new THREE.Scene();

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.5, 4.5);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const blueLight = new THREE.PointLight(0x00d2ff, 5, 10);
    blueLight.position.set(1, 2, 2);
    scene.add(blueLight);

    // 5. Construct 3D Quadcopter Drone Geometry
    const droneGroup = new THREE.Group();

    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.9, roughness: 0.2 });
    const armMat = new THREE.MeshStandardMaterial({ color: 0x374151, metalness: 0.8, roughness: 0.3 });
    const propMat = new THREE.MeshBasicMaterial({ color: 0x0088ff, opacity: 0.8, transparent: true });
    const cameraMat = new THREE.MeshStandardMaterial({ color: 0x00f0ff, metalness: 0.95 });

    // Main Frame Body
    const bodyGeo = new THREE.BoxGeometry(0.7, 0.2, 0.7);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    droneGroup.add(body);

    // Camera Gimbal Pod
    const gimbalGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const gimbal = new THREE.Mesh(gimbalGeo, cameraMat);
    gimbal.position.set(0, -0.2, 0.3);
    droneGroup.add(gimbal);

    // 4 Arms & Spinning Propeller Discs
    const propGroupArray: THREE.Mesh[] = [];
    const armCoords = [
      { x: 0.9, z: 0.9 },
      { x: -0.9, z: 0.9 },
      { x: 0.9, z: -0.9 },
      { x: -0.9, z: -0.9 },
    ];

    armCoords.forEach((coord) => {
      // Carbon Arm
      const armGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.2, 8);
      const arm = new THREE.Mesh(armGeo, armMat);
      arm.rotation.z = Math.PI / 2;
      arm.rotation.y = Math.atan2(coord.z, coord.x);
      droneGroup.add(arm);

      // Motor Cap
      const motorGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.15, 12);
      const motor = new THREE.Mesh(motorGeo, bodyMat);
      motor.position.set(coord.x, 0.08, coord.z);
      droneGroup.add(motor);

      // Glowing Blue Spinning Rotor Disc
      const propGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.02, 16);
      const prop = new THREE.Mesh(propGeo, propMat);
      prop.position.set(coord.x, 0.18, coord.z);
      droneGroup.add(prop);
      propGroupArray.push(prop);
    });

    scene.add(droneGroup);
    droneGroup.rotation.x = 0.3;

    // 6. Interactive Mouse Hover Tracking
    let targetRotationX = 0.3;
    let targetRotationY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      targetRotationY = x * 1.2;
      targetRotationX = 0.3 - y * 0.5;
    };

    container.addEventListener('mousemove', handleMouseMove);

    // 7. Animation Loop with High Speed Propeller Rotation & Hover Float
    let clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Drone hover oscillation
      droneGroup.position.y = Math.sin(elapsedTime * 2.5) * 0.1;

      // High-speed propeller spin
      propGroupArray.forEach((prop, i) => {
        prop.rotation.y += (i % 2 === 0 ? 0.4 : -0.4);
      });

      // Smooth mouse rotation tilt
      droneGroup.rotation.y += (targetRotationY - droneGroup.rotation.y) * 0.08;
      droneGroup.rotation.x += (targetRotationX - droneGroup.rotation.x) * 0.08;

      renderer.render(scene, camera);
    };

    animate();

    // 8. Cleanup
    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousemove', handleMouseMove);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full min-h-[300px] cursor-grab active:cursor-grabbing flex items-center justify-center"
      title="Hover or move mouse over to tilt 3D Flight Drone in real-time"
    />
  );
};
