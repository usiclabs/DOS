"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Star, Zap, Target, Award } from "lucide-react"

interface Achievement {
  id: string
  title: string
  description: string
  icon: any
  progress: number
  maxProgress: number
  reward: string
  unlocked: boolean
}

export function GamificationProgress() {
  const [level, setLevel] = useState(7)
  const [xp, setXp] = useState(3450)
  const [nextLevelXp] = useState(5000)
  const [achievements, setAchievements] = useState<Achievement[]>([])

  useEffect(() => {
    const mockAchievements: Achievement[] = [
      {
        id: "1",
        title: "First Deployment",
        description: "Deploy your first liquidity position",
        icon: Zap,
        progress: 1,
        maxProgress: 1,
        reward: "100 XP",
        unlocked: true,
      },
      {
        id: "2",
        title: "Yield Master",
        description: "Earn $10,000 in fees",
        icon: Target,
        progress: 7250,
        maxProgress: 10000,
        reward: "500 XP + Badge",
        unlocked: false,
      },
      {
        id: "3",
        title: "Diamond Hands",
        description: "Hold a position for 30 days",
        icon: Award,
        progress: 23,
        maxProgress: 30,
        reward: "250 XP",
        unlocked: false,
      },
    ]
    setAchievements(mockAchievements)
  }, [])

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-400" />
            <CardTitle>Your Progress</CardTitle>
          </div>
          <Badge className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 border-yellow-500/30">
            Level {level}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Experience</span>
            <span className="text-white font-semibold">
              {xp} / {nextLevelXp} XP
            </span>
          </div>
          <Progress value={(xp / nextLevelXp) * 100} className="h-3 progress-enhanced" />
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-white">Recent Achievements</h4>
          {achievements.map((achievement) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-3 rounded-lg border ${
                achievement.unlocked ? "border-yellow-500/30 bg-yellow-500/5" : "border-white/10 bg-white/5"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${achievement.unlocked ? "bg-yellow-500/20" : "bg-white/10"}`}>
                  <achievement.icon
                    className={`h-5 w-5 ${achievement.unlocked ? "text-yellow-400" : "text-gray-400"}`}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white text-sm">{achievement.title}</span>
                    {achievement.unlocked && <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />}
                  </div>
                  <p className="text-xs text-gray-400 mb-2">{achievement.description}</p>
                  {!achievement.unlocked && (
                    <>
                      <Progress value={(achievement.progress / achievement.maxProgress) * 100} className="h-2 mb-1" />
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">
                          {achievement.progress} / {achievement.maxProgress}
                        </span>
                        <span className="text-yellow-400">{achievement.reward}</span>
                      </div>
                    </>
                  )}
                  {achievement.unlocked && (
                    <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-300 border-yellow-500/30">
                      Unlocked • {achievement.reward}
                    </Badge>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
