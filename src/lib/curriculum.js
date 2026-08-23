// RUET Mechanical Engineering curriculum — used to auto-generate a
// student's courses when they pick their semester instead of typing
// everything by hand.
//
// type: 'theory' | 'sessional'
// credit: as listed in the curriculum book
// track: whether attendance tracking makes sense for this entry.
//   Project/Thesis/Seminar/Industrial Training aren't regular lecture
//   classes, so they're excluded by default (untrack: true) but still
//   listed in case a student wants to add them manually.

export const CURRICULUM = {
  '1st Year Odd': [
    { code: 'Chem 1121', name: 'Chemistry', type: 'theory', credit: 3 },
    { code: 'Phy 1121', name: 'Physics', type: 'theory', credit: 3 },
    { code: 'Hum 1121', name: 'Economics and Sociology', type: 'theory', credit: 3 },
    { code: 'Math 1121', name: 'Differential Calculus and Geometry', type: 'theory', credit: 3 },
    { code: 'ME 1101', name: 'Basic Mechanical Engineering', type: 'theory', credit: 3 },
    { code: 'Chem 1122', name: 'Chemistry Sessional', type: 'sessional', credit: 0.75 },
    { code: 'Phy 1122', name: 'Physics Sessional', type: 'sessional', credit: 0.75 },
    { code: 'ME 1102', name: 'Basic Mechanical Engineering Sessional', type: 'sessional', credit: 0.75 },
    { code: 'ME 1100', name: 'Mechanical Engineering Drawing', type: 'sessional', credit: 1.5 },
    { code: 'MES 1108', name: 'Shop Practice', type: 'sessional', credit: 0.75 },
  ],
  '1st Year Even': [
    { code: 'Hum 1221', name: 'Technical English', type: 'theory', credit: 3 },
    { code: 'Math 1221', name: 'Vector, Matrix and Integral Calculus', type: 'theory', credit: 3 },
    { code: 'CSE 1281', name: 'Computer and Programming Language', type: 'theory', credit: 3 },
    { code: 'EEE 1281', name: 'Electrical Circuits', type: 'theory', credit: 3 },
    { code: 'ME 1207', name: 'Production Process', type: 'theory', credit: 3 },
    { code: 'Hum 1222', name: 'Technical English Sessional', type: 'sessional', credit: 1 },
    { code: 'CSE 1282', name: 'Computer and Programming Language Sessional', type: 'sessional', credit: 1.5 },
    { code: 'EEE 1282', name: 'Electrical Circuits Sessional', type: 'sessional', credit: 0.75 },
    { code: 'ME 1208', name: 'Production Process Sessional', type: 'sessional', credit: 1.5 },
  ],
  '2nd Year Odd': [
    { code: 'Hum 2121', name: 'Accounting and Industrial Law', type: 'theory', credit: 3 },
    { code: 'Math 2121', name: 'Differential Equation, Complex Variable and Harmonic Analysis', type: 'theory', credit: 4 },
    { code: 'ME 2101', name: 'Thermodynamics', type: 'theory', credit: 3 },
    { code: 'ME 2103', name: 'Engineering Mechanics-I', type: 'theory', credit: 3 },
    { code: 'ME 2105', name: 'Fluid Mechanics-I', type: 'theory', credit: 3 },
    { code: 'ME 2102', name: 'Thermodynamics Sessional', type: 'sessional', credit: 1.5 },
    { code: 'ME 2106', name: 'Fluid Mechanics-I Sessional', type: 'sessional', credit: 1.5 },
    { code: 'ME 2100', name: 'Computer Aided Drawing', type: 'sessional', credit: 1.5 },
  ],
  '2nd Year Even': [
    { code: 'Math 2221', name: 'Numerical Analysis and Statistics', type: 'theory', credit: 3 },
    { code: 'EEE 2281', name: 'Electrical Machines and Electronics', type: 'theory', credit: 3 },
    { code: 'ME 2203', name: 'Engineering Mechanics-II', type: 'theory', credit: 3 },
    { code: 'ME 2207', name: 'Measurement, Quality Control and Materials Handling', type: 'theory', credit: 3 },
    { code: 'ME 2209', name: 'Mechanics of Solids', type: 'theory', credit: 3 },
    { code: 'EEE 2282', name: 'Electrical Machines and Electronics Sessional', type: 'sessional', credit: 1.5 },
    { code: 'Math 2222', name: 'Numerical Analysis and Statistics Sessional', type: 'sessional', credit: 1.5 },
    { code: 'ME 2204', name: 'Engineering Mechanics-II Sessional', type: 'sessional', credit: 0.75 },
    { code: 'ME 2208', name: 'Measurement, Quality Control and Materials Handling Sessional', type: 'sessional', credit: 0.75 },
    { code: 'ME 2210', name: 'Mechanics of Solids Sessional', type: 'sessional', credit: 0.75 },
  ],
  '3rd Year Odd': [
    { code: 'ME 3101', name: 'Heat Transfer-I', type: 'theory', credit: 3 },
    { code: 'ME 3105', name: 'Fluid Mechanics-II', type: 'theory', credit: 3 },
    { code: 'ME 3109', name: 'Design of Machine Elements-I', type: 'theory', credit: 3 },
    { code: 'ME 3115', name: 'Instrumentation and Control', type: 'theory', credit: 3 },
    { code: 'ME 3119', name: 'Engineering Materials and Metallurgy', type: 'theory', credit: 4 },
    { code: 'ME 3106', name: 'Fluid Mechanics-II Sessional', type: 'sessional', credit: 0.75 },
    { code: 'ME 3110', name: 'Design of Machine Elements-I Sessional', type: 'sessional', credit: 0.75 },
    { code: 'ME 3116', name: 'Instrumentation and Control Sessional', type: 'sessional', credit: 0.75 },
    { code: 'ME 3120', name: 'Engineering Materials and Metallurgy Sessional', type: 'sessional', credit: 0.75 },
    { code: 'ME 3114', name: 'CFD Sessional', type: 'sessional', credit: 0.75 },
  ],
  '3rd Year Even': [
    { code: 'ME 3201', name: 'Heat Transfer-II', type: 'theory', credit: 3 },
    { code: 'ME 3203', name: 'Machine Dynamics and Vibration', type: 'theory', credit: 3 },
    { code: 'ME 3209', name: 'Design of Machine Elements-II', type: 'theory', credit: 3 },
    { code: 'ME 3213', name: 'Optional-I', type: 'theory', credit: 3 },
    { code: 'ME 3215', name: 'Basic Mechatronics Engineering', type: 'theory', credit: 3 },
    { code: 'ME 3202', name: 'Heat Transfer-II Sessional', type: 'sessional', credit: 1.5 },
    { code: 'ME 3204', name: 'Machine Dynamics and Vibration Sessional', type: 'sessional', credit: 0.75 },
    { code: 'ME 3210', name: 'Design of Machine Elements-II Sessional', type: 'sessional', credit: 1.5 },
    { code: 'ME 3200', name: 'Case Study in Mechanical Engineering', type: 'sessional', credit: 1 },
    { code: 'ME 3216', name: 'Basic Mechatronics Engineering Sessional', type: 'sessional', credit: 1.5 },
  ],
  '4th Year Odd': [
    { code: 'ME 4101', name: 'Applied Thermodynamics-I', type: 'theory', credit: 3 },
    { code: 'ME 4111', name: 'Refrigeration and Mechanical Equipment in Buildings', type: 'theory', credit: 3 },
    { code: 'ME 4117', name: 'Production Planning and Control', type: 'theory', credit: 3 },
    { code: 'ME 4121', name: 'Power Plant Engineering', type: 'theory', credit: 3 },
    { code: 'ME 4113', name: 'Optional-II', type: 'theory', credit: 3 },
    { code: 'ME 4102', name: 'Applied Thermodynamics-I Sessional', type: 'sessional', credit: 0.75 },
    { code: 'ME 4112', name: 'Refrigeration and Mechanical Equipment in Buildings Sessional', type: 'sessional', credit: 0.75 },
    { code: 'ME 4100', name: 'Project and Thesis', type: 'sessional', credit: 1.5, untrack: true },
    { code: 'ME 4110', name: 'Seminar', type: 'sessional', credit: 1, untrack: true },
    { code: 'ME 4120', name: 'Industrial Training', type: 'sessional', credit: 1, untrack: true },
  ],
  '4th Year Even': [
    { code: 'ME 4201', name: 'Applied Thermodynamics-II', type: 'theory', credit: 3 },
    { code: 'ME 4205', name: 'Fluid Machinery', type: 'theory', credit: 3 },
    { code: 'ME 4207', name: 'Machine Tools and Tool Design', type: 'theory', credit: 3 },
    { code: 'ME 4217', name: 'Industrial Management', type: 'theory', credit: 3 },
    { code: 'ME 4213', name: 'Optional-III', type: 'theory', credit: 3 },
    { code: 'ME 4206', name: 'Fluid Machinery Sessional', type: 'sessional', credit: 0.75 },
    { code: 'ME 4208', name: 'Machine Tools and Tool Design Sessional', type: 'sessional', credit: 0.75 },
    { code: 'ME 4200', name: 'Project and Thesis', type: 'sessional', credit: 3, untrack: true },
    { code: 'ME 4210', name: 'Seminar', type: 'sessional', credit: 1, untrack: true },
  ],
}

export const SEMESTER_NAMES = Object.keys(CURRICULUM)
