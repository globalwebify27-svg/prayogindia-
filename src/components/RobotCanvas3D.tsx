'use client';

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

export const RobotCanvas3D: React.FC = () => {
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
    camera.position.set(0, 1.2, 5.5);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const bluePointLight = new THREE.PointLight(0x0088ff, 4, 10);
    bluePointLight.position.set(2, 3, 2);
    scene.add(bluePointLight);

    const cyanPointLight = new THREE.PointLight(0x00f0ff, 3, 10);
    cyanPointLight.position.set(-2, 1, 2);
    scene.add(cyanPointLight);

    // 5. Construct 3D Metallic Humanoid Robot Geometry
    const robotGroup = new THREE.Group();

    // Metallic material with blue specular reflection
    const metalMaterial = new THREE.MeshStandardMaterial({
      color: 0x223344,
      metalness: 0.9,
      roughness: 0.2,
      wireframe: false,
    });

    const glowMaterial = new THREE.MeshBasicMaterial({ color: 0x00d2ff });
    const silverMaterial = new THREE.MeshStandardMaterial({ color: 0x99bbdd, metalness: 0.95, roughness: 0.1 });

    // Head
    const headGeo = new THREE.SphereGeometry(0.35, 16, 16);
    headGeo.scale(1, 1.2, 0.9);
    const head = new THREE.Mesh(headGeo, metalMaterial);
    head.position.y = 1.8;
    robotGroup.add(head);

    // Visor / Eye Glow
    const visorGeo = new THREE.BoxGeometry(0.4, 0.08, 0.2);
    const visor = new THREE.Mesh(visorGeo, glowMaterial);
    visor.position.set(0, 1.85, 0.25);
    robotGroup.add(visor);

    // Chest / Torso
    const torsoGeo = new THREE.CylinderGeometry(0.5, 0.35, 1.1, 8);
    const torso = new THREE.Mesh(torsoGeo, metalMaterial);
    torso.position.y = 0.9;
    robotGroup.add(torso);

    // Core Reactor Light
    const coreGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const core = new THREE.Mesh(coreGeo, glowMaterial);
    core.position.set(0, 1.1, 0.35);
    robotGroup.add(core);

    // Shoulders & Arms
    const shoulderGeo = new THREE.SphereGeometry(0.18, 12, 12);
    const armGeo = new THREE.CylinderGeometry(0.1, 0.08, 0.7, 8);

    const leftShoulder = new THREE.Mesh(shoulderGeo, silverMaterial);
    leftShoulder.position.set(-0.65, 1.3, 0);
    robotGroup.add(leftShoulder);

    const leftArm = new THREE.Mesh(armGeo, metalMaterial);
    leftArm.position.set(-0.7, 0.85, 0);
    robotGroup.add(leftArm);

    const rightShoulder = new THREE.Mesh(shoulderGeo, silverMaterial);
    rightShoulder.position.set(0.65, 1.3, 0);
    robotGroup.add(rightShoulder);

    const rightArm = new THREE.Mesh(armGeo, metalMaterial);
    rightArm.position.set(0.7, 0.85, 0);
    robotGroup.add(rightArm);

    // Pelvis & Legs
    const hipGeo = new THREE.BoxGeometry(0.6, 0.2, 0.35);
    const hip = new THREE.Mesh(hipGeo, silverMaterial);
    hip.position.y = 0.25;
    robotGroup.add(hip);

    const legGeo = new THREE.CylinderGeometry(0.12, 0.09, 0.9, 8);
    const leftLeg = new THREE.Mesh(legGeo, metalMaterial);
    leftLeg.position.set(-0.25, -0.3, 0);
    robotGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, metalMaterial);
    rightLeg.position.set(0.25, -0.3, 0);
    robotGroup.add(rightLeg);

    // Holographic Orbital Rings underneath
    const ringGeo = new THREE.TorusGeometry(0.8, 0.015, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x0088ff, opacity: 0.6, transparent: true });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -0.75;
    robotGroup.add(ring);

    scene.add(robotGroup);

    // 6. Hover & Mouse Interactive Tracking
    let targetRotationX = 0;
    let targetRotationY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      targetRotationY = x * 0.8;
      targetRotationX = -y * 0.4;
    };

    container.addEventListener('mousemove', handleMouseMove);

    // 7. Render Loop with Continuous Floating Motion
    let clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth floating motion
      robotGroup.position.y = Math.sin(elapsedTime * 2) * 0.08;

      // Smooth rotation interpolation on mouse move
      robotGroup.rotation.y += (targetRotationY - robotGroup.rotation.y) * 0.08;
      robotGroup.rotation.x += (targetRotationX - robotGroup.rotation.x) * 0.08;

      // Rotate holographic ring
      ring.rotation.z += 0.01;

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
      title="Hover or move mouse over to tilt 3D Robot in real-time"
    />
  );
};
