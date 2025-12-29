"use client"

import { useEffect, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Text3D, Environment } from "@react-three/drei"

interface Canvas3DCountdownProps {
  endDate: Date
}

function CountdownDisplay({
  timeLeft,
}: { timeLeft: { days: number; hours: number; minutes: number; seconds: number } }) {
  const primaryColor = "#eb5a3c" // Platform red-orange
  const accentColor = "#daa520" // Platform gold

  return (
    <group position={[0, 0, 0]} scale={0.65}>
      {/* Days */}
      <group position={[-6, 1.5, 0]}>
        <Text3D
          font="/fonts/Geist_Bold.json"
          size={2.2}
          height={0.2}
          curveSegments={12}
          position={[-0.5, 0.5, 0]}
          castShadow
        >
          {String(timeLeft.days).padStart(2, "0")}
          <meshStandardMaterial color={primaryColor} emissive={primaryColor} emissiveIntensity={0.4} />
        </Text3D>
        <Text3D font="/fonts/Geist_Regular.json" size={0.7} height={0.1} position={[-0.8, -1.5, 0]}>
          DAYS
          <meshStandardMaterial color={accentColor} />
        </Text3D>
      </group>

      {/* Hours */}
      <group position={[-2, 1.5, 0]}>
        <Text3D
          font="/fonts/Geist_Bold.json"
          size={2.2}
          height={0.2}
          curveSegments={12}
          position={[-0.5, 0.5, 0]}
          castShadow
        >
          {String(timeLeft.hours).padStart(2, "0")}
          <meshStandardMaterial color={primaryColor} emissive={primaryColor} emissiveIntensity={0.4} />
        </Text3D>
        <Text3D font="/fonts/Geist_Regular.json" size={0.7} height={0.1} position={[-1.1, -1.5, 0]}>
          HOURS
          <meshStandardMaterial color={accentColor} />
        </Text3D>
      </group>

      {/* Minutes */}
      <group position={[2, 1.5, 0]}>
        <Text3D
          font="/fonts/Geist_Bold.json"
          size={2.2}
          height={0.2}
          curveSegments={12}
          position={[-0.5, 0.5, 0]}
          castShadow
        >
          {String(timeLeft.minutes).padStart(2, "0")}
          <meshStandardMaterial color={primaryColor} emissive={primaryColor} emissiveIntensity={0.4} />
        </Text3D>
        <Text3D font="/fonts/Geist_Regular.json" size={0.7} height={0.1} position={[-0.9, -1.5, 0]}>
          MINS
          <meshStandardMaterial color={accentColor} />
        </Text3D>
      </group>

      {/* Seconds */}
      <group position={[6, 1.5, 0]}>
        <Text3D
          font="/fonts/Geist_Bold.json"
          size={2.2}
          height={0.2}
          curveSegments={12}
          position={[-0.5, 0.5, 0]}
          castShadow
        >
          {String(timeLeft.seconds).padStart(2, "0")}
          <meshStandardMaterial color={primaryColor} emissive={primaryColor} emissiveIntensity={0.4} />
        </Text3D>
        <Text3D font="/fonts/Geist_Regular.json" size={0.7} height={0.1} position={[-1.0, -1.5, 0]}>
          SECS
          <meshStandardMaterial color={accentColor} />
        </Text3D>
      </group>

      {/* Rotating Ring with platform colors */}
      <mesh rotation={[0, 0, 0]} position={[0, 0, 0]}>
        <torusGeometry args={[7.5, 0.25, 16, 64]} />
        <meshStandardMaterial color={primaryColor} emissive={accentColor} emissiveIntensity={0.2} wireframe />
      </mesh>
    </group>
  )
}

export default function Canvas3DCountdown({ endDate }: Canvas3DCountdownProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime()
      const end = endDate.getTime()
      const difference = end - now

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        })
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [endDate])

  return (
    <Canvas camera={{ position: [0, 0, 16], fov: 40 }} style={{ width: "100%", height: "100%" }}>
      <Environment preset="sunset" />
      <CountdownDisplay timeLeft={timeLeft} />
      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1.5} />
    </Canvas>
  )
}
