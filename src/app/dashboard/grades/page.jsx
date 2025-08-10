'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { BarChart3, TrendingUp, Award, BookOpen, Sparkles, Zap, Target } from 'lucide-react'
import toast from 'react-hot-toast'

export default function GradesPage() {
  const { data: session } = useSession()
  const [grades, setGrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSubject, setSelectedSubject] = useState('')
  const [subjects, setSubjects] = useState([])
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 300], [0, 50])

  const fetchGrades = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (selectedSubject) params.append('subject', selectedSubject)
      
      const response = await fetch(`/api/grades?${params}`)
      if (response.ok) {
        const data = await response.json()
        setGrades(data.grades || [])
      } else {
        toast.error('Failed to fetch grades')
      }
    } catch (error) {
      toast.error('Error fetching grades')
    } finally {
      setLoading(false)
    }
  }, [selectedSubject])

  const fetchSubjects = useCallback(async () => {
    try {
      const response = await fetch('/api/subjects')
      if (response.ok) {
        const data = await response.json()
        setSubjects(data.subjects || [])
      }
    } catch (error) {
      console.error('Error fetching subjects:', error)
    }
  }, [])

  useEffect(() => {
    fetchGrades()
    fetchSubjects()
  }, [fetchGrades, fetchSubjects])

  const calculateGPA = () => {
    if (grades.length === 0) return 0
    
    const totalPoints = grades.reduce((sum, grade) => {
      const points = grade.marks / grade.maxMarks * 4
      return sum + points
    }, 0)
    
    return (totalPoints / grades.length).toFixed(2)
  }

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600'
    if (percentage >= 80) return 'text-blue-600'
    if (percentage >= 70) return 'text-yellow-600'
    if (percentage >= 60) return 'text-orange-600'
    return 'text-red-600'
  }

  const getGradeLetter = (percentage) => {
    if (percentage >= 90) return 'A+'
    if (percentage >= 80) return 'A'
    if (percentage >= 70) return 'B+'
    if (percentage >= 60) return 'B'
    if (percentage >= 50) return 'C'
    return 'F'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative"
        >
          <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ 
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 blur-xl"
          />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="space-y-6 relative overflow-hidden">
      {/* Animated Background */}
      <motion.div
        style={{ y }}
        className="absolute inset-0 -z-10"
      >
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="relative">
            <motion.h1 
              className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              Grades & Performance
            </motion.h1>
            <motion.p 
              className="text-gray-600 dark:text-gray-300 mt-2 text-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              Track your academic performance with style ✨
            </motion.p>
            <motion.div
              className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
        </div>

        {/* Enhanced Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              duration: 0.5, 
              delay: 0.4,
              type: "spring",
              stiffness: 100
            }}
            whileHover={{ 
              scale: 1.05,
              y: -8,
              rotateY: 5
            }}
            className="transform-3d hover-lift backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 rounded-2xl p-6 border border-white/20 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Current GPA
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {calculateGPA()}
                </p>
              </div>
              <motion.div
                className="flex-shrink-0"
                whileHover={{ rotate: 360, scale: 1.2 }}
                transition={{ duration: 0.6 }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </motion.div>
            </div>
            
            <motion.div
              className="mt-4 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                initial={{ width: 0 }}
                animate={{ width: `${(calculateGPA() / 4) * 100}%` }}
                transition={{ delay: 1.2, duration: 1 }}
              />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              duration: 0.5, 
              delay: 0.5,
              type: "spring",
              stiffness: 100
            }}
            whileHover={{ 
              scale: 1.05,
              y: -8,
              rotateY: 5
            }}
            className="transform-3d hover-lift backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 rounded-2xl p-6 border border-white/20 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Total Assignments
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  {grades.length}
                </p>
              </div>
              <motion.div
                className="flex-shrink-0"
                whileHover={{ rotate: 360, scale: 1.2 }}
                transition={{ duration: 0.6 }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <Award className="h-6 w-6 text-white" />
                </div>
              </motion.div>
            </div>
            
            <motion.div
              className="mt-4 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1.1, duration: 0.8 }}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-green-500 to-blue-600"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((grades.length / 10) * 100, 100)}%` }}
                transition={{ delay: 1.3, duration: 1 }}
              />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              duration: 0.5, 
              delay: 0.6,
              type: "spring",
              stiffness: 100
            }}
            whileHover={{ 
              scale: 1.05,
              y: -8,
              rotateY: 5
            }}
            className="transform-3d hover-lift backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 rounded-2xl p-6 border border-white/20 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Subjects
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {subjects.length}
                </p>
              </div>
              <motion.div
                className="flex-shrink-0"
                whileHover={{ rotate: 360, scale: 1.2 }}
                transition={{ duration: 0.6 }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
              </motion.div>
            </div>
            
            <motion.div
              className="mt-4 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-600"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((subjects.length / 6) * 100, 100)}%` }}
                transition={{ delay: 1.4, duration: 1 }}
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Enhanced Filters */}
        <motion.div 
          className="backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 rounded-2xl p-6 mb-6 border border-white/20 shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter by Subject
              </label>
              <div className="relative">
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                >
                  <option value="">All Subjects</option>
                  {subjects.map((subject) => (
                    <option key={subject._id} value={subject._id}>
                      {subject.code} - {subject.name}
                    </option>
                  ))}
                </select>
                <motion.div
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  animate={{ rotate: selectedSubject ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Zap className="w-4 h-4 text-gray-400" />
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Grades List */}
        <motion.div 
          className="backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 rounded-2xl p-6 border border-white/20 shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <motion.div
              className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center"
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Target className="h-4 w-4 text-white" />
            </motion.div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Assignment Grades
            </h2>
          </div>
          
          {grades.length === 0 ? (
            <motion.div 
              className="text-center py-16 backdrop-blur-lg bg-white/60 dark:bg-gray-800/60 rounded-2xl border border-white/20"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9 }}
            >
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <BarChart3 className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              </motion.div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No grades available
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Your grades will appear here once assignments are graded.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {grades.map((grade, index) => {
                const percentage = (grade.marks / grade.maxMarks) * 100
                const gradeLetter = getGradeLetter(percentage)
                
                return (
                  <motion.div
                    key={grade._id}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ 
                      duration: 0.5,
                      delay: 1 + index * 0.1
                    }}
                    whileHover={{ 
                      scale: 1.02,
                      y: -5
                    }}
                    className="backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 group"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 transition-colors duration-300">
                          {grade.assignment?.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                          {grade.assignment?.subject?.code} - {grade.assignment?.subject?.name}
                        </p>
                        {grade.feedback && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 bg-blue-50 dark:bg-blue-900/30 px-3 py-2 rounded-lg">
                            <span className="font-semibold">Feedback:</span> {grade.feedback}
                          </p>
                        )}
                      </div>
                      <motion.div 
                        className="text-right"
                        whileHover={{ scale: 1.1 }}
                      >
                        <div className={`text-3xl font-bold ${getGradeColor(percentage)}`}>
                          {gradeLetter}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {grade.marks}/{grade.maxMarks} ({percentage.toFixed(1)}%)
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}

