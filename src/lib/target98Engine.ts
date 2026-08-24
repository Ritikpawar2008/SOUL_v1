import { AcademicPerformanceData, SubjectMarksEntry } from '../types';

export interface PerformanceSummary {
  hasEnoughData: boolean;
  currentPercentage: number | null;
  targetPercentage: number;
  gap: number | null;
  ctPercentage: number | null;
  assignmentPercentage: number | null;
  practicalPercentage: number | null;
  theoryPercentage: number | null;
  overallProgress: number; // 0 to 100
  totalObtained: number;
  totalMax: number;
  aiStrategicAdvice: string;
}

export class Target98Engine {
  static calculatePerformance(performanceData?: AcademicPerformanceData): PerformanceSummary {
    const targetPercentage = 98;

    if (!performanceData || !performanceData.scores || Object.keys(performanceData.scores).length === 0) {
      return {
        hasEnoughData: false,
        currentPercentage: null,
        targetPercentage,
        gap: null,
        ctPercentage: null,
        assignmentPercentage: null,
        practicalPercentage: null,
        theoryPercentage: null,
        overallProgress: 0,
        totalObtained: 0,
        totalMax: 0,
        aiStrategicAdvice: 'Not enough data to calculate current percentage. Enter your CT-1, Assignment, Practical or Prelim marks to begin 98% trajectory tracking.',
      };
    }

    let totalObtained = 0;
    let totalMax = 0;

    let ctObtained = 0;
    let ctMax = 0;

    let asgObtained = 0;
    let asgMax = 0;

    let pracObtained = 0;
    let pracMax = 0;

    let thObtained = 0;
    let thMax = 0;

    Object.values(performanceData.scores).forEach((subjectMarks: SubjectMarksEntry) => {
      // CT1
      if (subjectMarks.ct1 && subjectMarks.ct1.max > 0) {
        ctObtained += subjectMarks.ct1.obtained;
        ctMax += subjectMarks.ct1.max;
        totalObtained += subjectMarks.ct1.obtained;
        totalMax += subjectMarks.ct1.max;
      }
      // CT2
      if (subjectMarks.ct2 && subjectMarks.ct2.max > 0) {
        ctObtained += subjectMarks.ct2.obtained;
        ctMax += subjectMarks.ct2.max;
        totalObtained += subjectMarks.ct2.obtained;
        totalMax += subjectMarks.ct2.max;
      }
      // Assignments
      if (subjectMarks.assignments && subjectMarks.assignments.max > 0) {
        asgObtained += subjectMarks.assignments.obtained;
        asgMax += subjectMarks.assignments.max;
        totalObtained += subjectMarks.assignments.obtained;
        totalMax += subjectMarks.assignments.max;
      }
      // Practicals
      if (subjectMarks.practicals && subjectMarks.practicals.max > 0) {
        pracObtained += subjectMarks.practicals.obtained;
        pracMax += subjectMarks.practicals.max;
        totalObtained += subjectMarks.practicals.obtained;
        totalMax += subjectMarks.practicals.max;
      }
      // Theory / Prelim
      if (subjectMarks.theory && subjectMarks.theory.max > 0) {
        thObtained += subjectMarks.theory.obtained;
        thMax += subjectMarks.theory.max;
        totalObtained += subjectMarks.theory.obtained;
        totalMax += subjectMarks.theory.max;
      }
    });

    if (totalMax === 0) {
      return {
        hasEnoughData: false,
        currentPercentage: null,
        targetPercentage,
        gap: null,
        ctPercentage: null,
        assignmentPercentage: null,
        practicalPercentage: null,
        theoryPercentage: null,
        overallProgress: 0,
        totalObtained: 0,
        totalMax: 0,
        aiStrategicAdvice: 'Not enough data to calculate current percentage.',
      };
    }

    const currentPercentage = parseFloat(((totalObtained / totalMax) * 100).toFixed(1));
    const gap = parseFloat((targetPercentage - currentPercentage).toFixed(1));
    const ctPercentage = ctMax > 0 ? parseFloat(((ctObtained / ctMax) * 100).toFixed(1)) : null;
    const assignmentPercentage = asgMax > 0 ? parseFloat(((asgObtained / asgMax) * 100).toFixed(1)) : null;
    const practicalPercentage = pracMax > 0 ? parseFloat(((pracObtained / pracMax) * 100).toFixed(1)) : null;
    const theoryPercentage = thMax > 0 ? parseFloat(((thObtained / thMax) * 100).toFixed(1)) : null;
    const overallProgress = Math.min(100, Math.round((currentPercentage / targetPercentage) * 100));

    // Generate tailored AI strategy
    let aiStrategicAdvice = '';
    if (currentPercentage >= targetPercentage) {
      aiStrategicAdvice = `Phenomenal performance! You are currently operating at ${currentPercentage}%, on track for your 98% MSBTE target. Maintain spaced revisions across CLC, OSY, and STE to protect this baseline during final Theory exams.`;
    } else {
      const weakestAreas: string[] = [];
      if (ctPercentage !== null && ctPercentage < 95) weakestAreas.push(`Class Tests (${ctPercentage}%)`);
      if (practicalPercentage !== null && practicalPercentage < 95) weakestAreas.push(`Practical Labs (${practicalPercentage}%)`);
      if (assignmentPercentage !== null && assignmentPercentage < 95) weakestAreas.push(`Assignments (${assignmentPercentage}%)`);
      if (theoryPercentage !== null && theoryPercentage < 95) weakestAreas.push(`Theory/Prelims (${theoryPercentage}%)`);

      const focusArea = weakestAreas.length > 0 ? weakestAreas.join(' and ') : 'upcoming Class Tests and Theory Prelims';
      aiStrategicAdvice = `Your current performance is ${currentPercentage}% (${gap > 0 ? `${gap}% below` : 'near'} your 98% target). Your immediate high-yield leverage is improving ${focusArea} and completing pending syllabus units.`;
    }

    return {
      hasEnoughData: true,
      currentPercentage,
      targetPercentage,
      gap,
      ctPercentage,
      assignmentPercentage,
      practicalPercentage,
      theoryPercentage,
      overallProgress,
      totalObtained,
      totalMax,
      aiStrategicAdvice,
    };
  }
}
