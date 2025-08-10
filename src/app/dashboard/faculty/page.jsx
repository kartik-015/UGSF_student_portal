'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

export default function FacultyDirectoryPage(){
  const { data: session } = useSession()
  const [faculty,setFaculty] = useState([])
  const [dept,setDept] = useState('')
  const [search,setSearch] = useState('')
  const isAdmin = session?.user?.role==='admin'
  const isHod = session?.user?.role==='hod'

  const load = async () => {
    try {
      let url = '/api/faculty'
      const qs = []
      if (isAdmin && dept) qs.push(`department=${dept}`)
      if (search) qs.push(`search=${encodeURIComponent(search)}`)
      if (qs.length) url += `?${qs.join('&')}`
      const res = await fetch(url)
      if (res.ok){
        const data = await res.json(); setFaculty(data.faculty||[]) }
    } catch { toast.error('Failed to load faculty') }
  }
  useEffect(()=>{ load() },[dept,search])

  if (!session || (!isAdmin && !isHod)) return null

  const departments = ['CSE','IT','CE','ME','EC','CH','DIT']

  return (
    <div className='space-y-6'>
      <div className='flex flex-wrap gap-4 items-end'>
        <div>
          <h1 className='text-2xl font-bold'>Faculty Directory</h1>
          <p className='text-sm text-gray-500'>{isAdmin? 'All departments' : `Department: ${session.user.department}`}</p>
        </div>
        {isAdmin && (
          <select value={dept} onChange={e=>setDept(e.target.value)} className='px-3 py-2 border rounded text-sm bg-white dark:bg-gray-800'>
            <option value=''>All Departments</option>
            {departments.map(d=> <option key={d}>{d}</option>)}
          </select>
        )}
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder='Search name/email' className='px-3 py-2 border rounded text-sm flex-1 min-w-[240px] bg-white dark:bg-gray-800'/>
      </div>
      <div className='grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
        {faculty.map(f => (
          <motion.div key={f._id} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} className='p-4 rounded-lg border bg-white dark:bg-gray-800 space-y-2'>
            <div className='flex items-center justify-between'>
              <h3 className='font-semibold text-sm'>{f.academicInfo?.name || f.email.split('@')[0]}</h3>
              <span className='text-[10px] px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-700 text-indigo-700 dark:text-indigo-100'>{f.role}</span>
            </div>
            <p className='text-[11px] text-gray-500 break-all'>{f.email}</p>
            <p className='text-[11px] text-gray-500'>{f.department}</p>
            {f.specialization && <p className='text-[11px] text-gray-600 dark:text-gray-300'>Spec: {f.specialization}</p>}
            {f.education && <p className='text-[11px] text-gray-600 dark:text-gray-300'>Edu: {f.education}</p>}
          </motion.div>
        ))}
        {faculty.length===0 && (
          <div className='col-span-full text-sm text-gray-500'>No faculty found.</div>
        )}
      </div>
    </div>
  )
}
