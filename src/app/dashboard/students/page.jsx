'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Users, Search, Filter, Eye, Edit, Mail, Phone } from 'lucide-react'
import toast from 'react-hot-toast'

export default function StudentsPage() {
  const { data: session } = useSession()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [selectedSemester, setSelectedSemester] = useState('')

  const fetchStudents = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      params.append('department', selectedDepartment ?? '')
      params.append('semester', selectedSemester ?? '')
      if (searchTerm) params.append('search', searchTerm)
      const response = await fetch(`/api/students?${params}`)
      if (response.ok) {
        const data = await response.json()
        setStudents(data.students || [])
      } else {
        toast.error('Failed to fetch students')
      }
    } catch (error) {
      toast.error('Error fetching students')
    } finally {
      setLoading(false)
    }
  }, [searchTerm, selectedDepartment, selectedSemester])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  const departments = ['CSE', 'CE', 'IT', 'ME', 'EC', 'CH', 'DIT']
  const semesters = [1, 2, 3, 4, 5, 6, 7, 8]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Students
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              {session?.user?.role === 'admin' 
                ? 'Manage all students'
                : 'View your assigned students'
              }
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Students
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, email, or roll number..."
                  className="input pl-10"
                />
              </div>
            </div>
            
            <div className="min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Department
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="input"
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Semester
              </label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="input"
              >
                <option value="">All Semesters</option>
                {semesters.map((sem) => (
                  <option key={sem} value={sem}>
                    Semester {sem}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Students List */}
        <div className="grid gap-6">
          {students.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No students found
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Try adjusting your search criteria
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {students.map((student) => (
                <motion.div
                  key={student._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="card p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {student.academicInfo?.name || student.email.split('@')[0]}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {student.email}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                          {student.department}
                        </span>
                        <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                          Sem {student.academicInfo?.semester}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {student.academicInfo?.rollNumber && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Roll No:</span>
                        <span>{student.academicInfo.rollNumber}</span>
                      </div>
                    )}
                    {student.academicInfo?.phoneNumber && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Phone className="w-4 h-4" />
                        <span>{student.academicInfo.phoneNumber}</span>
                      </div>
                    )}
                    {student.academicInfo?.address && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Address:</span>
                        <p className="mt-1">{student.academicInfo.address}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="btn btn-outline btn-sm">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </button>
                    <button className="btn btn-outline btn-sm">
                      <Mail className="w-4 h-4 mr-1" />
                      Contact
                    </button>
                    {session?.user?.role === 'admin' && (
                      <button className="btn btn-outline btn-sm">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
