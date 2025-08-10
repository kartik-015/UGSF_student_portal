import { POST } from '../src/app/api/auth/register/route.js'

// Simple mock request object
function makeRequest(body){
  return { async json(){ return body } }
}

async function run(){
  const cases = [
    { email: 'f1@charusat.ac.in', password: 'secret12', role: 'faculty' },
    { email: 'hod_cse@charusat.ac.in', password: 'secret12', role: 'hod' },
    { email: 'bad_faculty@charusat.edu.in', password: 'secret12', role: 'faculty' },
    { email: '23DIT015@charusat.edu.in', password: 'secret12', role: 'student' },
    { email: '23DIT015@charusat.ac.in', password: 'secret12', role: 'student' }
  ]
  for (const c of cases){
    const res = await POST(makeRequest(c))
    const data = await res.json()
    console.log(c.email, '=>', res.status, data)
  }
}
run()
