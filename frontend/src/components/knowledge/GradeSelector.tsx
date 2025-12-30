import type { GradeType, SemesterType } from '../../types/knowledge';
import './GradeSelector.css';

interface GradeSelectorProps {
  currentGrade: GradeType;
  currentSemester: SemesterType;
  onGradeChange: (grade: GradeType) => void;
  onSemesterChange: (semester: SemesterType) => void;
}

const grades: GradeType[] = ['七年级', '八年级', '九年级'];
const semesters: SemesterType[] = ['上册', '下册'];

const GradeSelector: React.FC<GradeSelectorProps> = ({
  currentGrade,
  currentSemester,
  onGradeChange,
  onSemesterChange,
}) => {
  return (
    <div className="grade-selector">
      <div className="selector-group">
        <label className="selector-label">年级:</label>
        <div className="grade-buttons">
          {grades.map((grade) => (
            <button
              key={grade}
              className={`grade-button ${currentGrade === grade ? 'active' : ''}`}
              onClick={() => onGradeChange(grade)}
            >
              {grade}
            </button>
          ))}
        </div>
      </div>

      <div className="selector-group">
        <label className="selector-label">学期:</label>
        <div className="semester-buttons">
          {semesters.map((semester) => (
            <button
              key={semester}
              className={`semester-button ${currentSemester === semester ? 'active' : ''}`}
              onClick={() => onSemesterChange(semester)}
            >
              {semester}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GradeSelector;
