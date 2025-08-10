'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

export default function ProjectsPage() {
  const { data: session } = useSession()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [faculty, setFaculty] = useState([])
  const [form, setForm] = useState({ title: '', description: '', domain: '', department: '', semester: 1, members: [] })
  const [teamSize, setTeamSize] = useState(0) // additional members besides leader
  const [memberInputs, setMemberInputs] = useState([]) // stores emails or ids
  const [myProjects, setMyProjects] = useState([])
  const [addingMemberId, setAddingMemberId] = useState('')
  const [removeMemberId, setRemoveMemberId] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const externalGuideOptions = [
    { name: 'Dr. Alice Smith', organization: 'TechLabs', email: 'alice@techlabs.com' },
    { name: 'Mr. Bob Kumar', organization: 'InnoSoft', email: 'bob@innosoft.io' },
    { name: 'Ms. Chen Li', organization: 'DataEdge', email: 'chen@datatedge.ai' }
  ]
  const isStudent = session?.user?.role === 'student'
  const isHod = session?.user?.role === 'hod'

  const load = async () => {
    const res = await fetch('/api/projects')
    const data = await res.json()
    setProjects(data.projects || [])
    if (session?.user?.role === 'student') {
      setMyProjects((data.projects || []).filter(p => p.members.some(m=>m.student?._id===session.user.id)))
    }
    setLoading(false)
  }

  useEffect(() => { 
    load()
    const loadFaculty = async () => {
      if (!isHod) return
      const res = await fetch('/api/faculty')
      if (res.ok) {
        const data = await res.json()
        setFaculty(data.faculty || [])
      }
    }
    loadFaculty()
  }, [])

  const submitProject = async () => {
    try {
      const payload = { ...form }
      if (!payload.department) payload.department = session?.user?.department
      // Build memberEmails from memberInputs (ignore blanks)
      const memberEmails = memberInputs.map(m=>m.trim()).filter(Boolean)
      payload.memberEmails = memberEmails
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        toast.success('Project submitted')
        setForm({ title: '', description: '', domain: '', department: '', semester: 1, members: [] })
        setTeamSize(0)
        setMemberInputs([])
        load()
      } else {
        const e = await res.json(); toast.error(e.error || 'Failed')
      }
    } catch (e) { toast.error('Failed') }
  }

  const approveProject = async (projectId, approve) => {
    const res = await fetch('/api/projects', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ projectId, approve }) })
    if (res.ok) { toast.success('Updated'); load() } else { const e = await res.json(); toast.error(e.error || 'Error') }
  }

  const assignInternalGuide = async (projectId, internalGuideId, externalGuide) => {
    const res = await fetch('/api/projects', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ projectId, internalGuideId, externalGuide }) })
    if (res.ok) { toast.success('Guide assigned'); load() } else { const e = await res.json(); toast.error(e.error || 'Error') }
  }

  const addMember = async (projectId) => {
    if (!addingMemberId) { toast.error('Enter student email or id'); return }
    const res = await fetch('/api/projects', { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ projectId, addMember: addingMemberId }) })
    if (res.ok) { toast.success('Member added'); setAddingMemberId(''); load() } else { const e = await res.json(); toast.error(e.error||'Failed') }
  }

  const removeMember = async (projectId, memberId) => {
    if (!memberId) return
    const res = await fetch('/api/projects', { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ projectId, removeMember: memberId }) })
    if (res.ok) { toast.success('Member removed'); load() } else { const e = await res.json(); toast.error(e.error||'Failed') }
  }

  const openProject = (p) => setSelectedProject(p)
  const closeProject = () => setSelectedProject(null)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Software Project Groups</h1>
        <div className="flex gap-2 items-center">
          {isStudent && <button onClick={()=>setShowCreateModal(true)} className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium shadow hover:bg-blue-700">Create Group</button>}
          <div className="flex gap-2">
            <button onClick={()=>setActiveTab('all')} className={`px-3 py-1 rounded text-xs ${activeTab==='all'?'bg-blue-600 text-white':'bg-gray-200 dark:bg-gray-700'}`}>All</button>
            {isStudent && <button onClick={()=>setActiveTab('mine')} className={`px-3 py-1 rounded text-xs ${activeTab==='mine'?'bg-blue-600 text-white':'bg-gray-200 dark:bg-gray-700'}`}>My Groups</button>}
          </div>
        </div>
      </div>

      {showCreateModal && isStudent && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 relative">
            <button onClick={()=>setShowCreateModal(false)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✕</button>
            {/* creation form moved here */}
            <h2 className="font-semibold text-lg mb-1">Create Project Group</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Leader = You. Add optional teammates now or later.</p>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium tracking-wide uppercase text-gray-600 dark:text-gray-300">Project Title</label>
                <input className="px-3 py-2.5 border rounded bg-gray-50 dark:bg-gray-700/40" placeholder="UGSF" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium tracking-wide uppercase text-gray-600 dark:text-gray-300">Domain / Tech Stack</label>
                <input className="px-3 py-2.5 border rounded bg-gray-50 dark:bg-gray-700/40" placeholder="Webdev" value={form.domain} onChange={e=>setForm({...form,domain:e.target.value})} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium tracking-wide uppercase text-gray-600 dark:text-gray-300">Department</label>
                <select className="px-3 py-2.5 border rounded bg-gray-50 dark:bg-gray-700/40" value={form.department} onChange={e=>setForm({...form,department:e.target.value})}>
                  <option value="">Select</option>
                  {['CSE','IT','CE','ME','EC','CH','DIT'].map(d=> <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium tracking-wide uppercase text-gray-600 dark:text-gray-300">Semester</label>
                <select className="px-3 py-2.5 border rounded bg-gray-50 dark:bg-gray-700/40" value={form.semester} onChange={e=>setForm({...form,semester:parseInt(e.target.value)})}>
                  {[1,2,3,4,5,6,7,8].map(s=> <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-[11px] font-medium tracking-wide uppercase text-gray-600 dark:text-gray-300">Project Description</label>
                <textarea className="px-3 py-2.5 border rounded bg-gray-50 dark:bg-gray-700/40 min-h-[80px]" placeholder="Concise problem statement, objective & expected impact..." value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
              </div>
              <div className="md:col-span-2">
                <label className="text-[11px] font-medium tracking-wide uppercase text-gray-600 dark:text-gray-300">Optional Teammates (emails or ids, comma separated)</label>
                <input className="mt-1 px-3 py-2 border rounded w-full bg-gray-50 dark:bg-gray-700/40" placeholder="s123cse001@charusat.edu.in, s123cse005@charusat.edu.in" onChange={e=> setMemberInputs(e.target.value.split(',').map(v=>v.trim()))} />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button className="px-4 py-2 text-sm rounded border" onClick={()=>setShowCreateModal(false)}>Cancel</button>
              <button className="px-5 py-2 rounded bg-blue-600 text-white text-sm" onClick={submitProject}>Create</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {(activeTab==='all'?projects:myProjects).map(p => (
          <motion.div key={p._id} className="p-4 rounded-lg border bg-white dark:bg-gray-800 flex flex-col cursor-pointer hover:shadow" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} onClick={()=> openProject(p)}>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold flex items-center gap-2">{p.title}<span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-700 text-indigo-700 dark:text-indigo-100">{p.groupId}</span></div>
                <div className="text-xs text-gray-500">Leader: {p.leader?.academicInfo?.name || p.leader?.email?.split('@')[0]}</div>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${p.status==='approved'?'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300': p.status==='rejected'?'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300':'bg-gray-100 dark:bg-gray-700'}`}>{p.status}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {selectedProject && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
          <motion.div initial={{opacity:0,scale:.9,y:20}} animate={{opacity:1,scale:1,y:0}} className="w-full max-w-3xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 relative space-y-4">
            <button onClick={closeProject} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✕</button>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold flex items-center gap-2">{selectedProject.title}<span className="text-[10px] px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-700 text-indigo-700 dark:text-indigo-100">{selectedProject.groupId}</span></h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Domain: {selectedProject.domain || '—'} • Department: {selectedProject.department} • Semester {selectedProject.semester}</p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className={`px-2 py-1 rounded ${selectedProject.status==='approved'?'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300': selectedProject.status==='rejected'?'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300':'bg-gray-100 dark:bg-gray-700'}`}>{selectedProject.status}</span>
              </div>
            </div>
            <div className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-line">{selectedProject.description || 'No description provided.'}</div>
            <div>
              <h4 className="text-sm font-medium mb-2 uppercase tracking-wide text-gray-600 dark:text-gray-400">Members ({selectedProject.members.length})</h4>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
                {selectedProject.members.map(m => (
                  <div key={m.student?._id} className="p-2 rounded border text-xs flex flex-col gap-1 bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex justify-between items-start">
                      <span className="font-semibold text-gray-700 dark:text-gray-200">{m.student?.academicInfo?.name || m.student?.email.split('@')[0]}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${m.role==='leader'?'bg-blue-600 text-white':'bg-gray-200 dark:bg-gray-700 dark:text-gray-300'}`}>{m.role}</span>
                    </div>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">{m.student?.email}</span>
                    {isStudent && selectedProject.leader?._id===session?.user?.id && m.role!=='leader' && (
                      <button onClick={()=>{ if(confirm('Remove member?')) removeMember(selectedProject._id, m.student?._id) }} className="mt-1 text-[10px] text-red-600 hover:text-red-700 self-start">Remove</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {isStudent && selectedProject.leader?._id===session?.user?.id && (
              <div className="pt-2 border-t">
                <h4 className="text-sm font-medium mb-2 uppercase tracking-wide text-gray-600 dark:text-gray-400">Manage Members</h4>
                <div className="flex gap-2">
                  <input value={addingMemberId} onChange={e=>setAddingMemberId(e.target.value)} placeholder="Student email or id" className="flex-1 px-3 py-2 border rounded text-xs bg-gray-50 dark:bg-gray-800" />
                  <button onClick={()=>addMember(selectedProject._id)} className="px-4 py-2 rounded bg-indigo-600 text-white text-xs">Add</button>
                </div>
              </div>
            )}
            {isHod && (
              <div className="pt-2 border-t space-y-3">
                <h4 className="text-sm font-medium mb-1 uppercase tracking-wide text-gray-600 dark:text-gray-400">Assign Guides (HOD)</h4>
                <div className="flex flex-wrap gap-2">
                  <select className="px-2 py-2 border rounded text-xs" defaultValue="" onChange={e=> assignInternalGuide(selectedProject._id, e.target.value || undefined)}>
                    <option value="">Internal Guide</option>
                    {faculty.filter(f=> f.department===selectedProject.department).map(f=> <option key={f._id} value={f._id}>{f.academicInfo?.name || f.email}</option>)}
                  </select>
                  <select className="px-2 py-2 border rounded text-xs" defaultValue="" onChange={e=> assignInternalGuide(selectedProject._id, undefined, externalGuideOptions.find(g=>g.email===e.target.value))}>
                    <option value="">External Guide</option>
                    {externalGuideOptions.map(g=> <option key={g.email} value={g.email}>{g.name}</option>)}
                  </select>
                </div>
              </div>
            )}
            <div className="pt-2 border-t text-[11px] text-gray-500 dark:text-gray-400">Chat Room: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{selectedProject.chatRoomId}</code></div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

