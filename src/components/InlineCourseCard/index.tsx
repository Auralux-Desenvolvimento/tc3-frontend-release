import { FC, useContext, useState } from "react";
import { Icon } from "@iconify/react";
import * as yup from "yup";

import "./style.css"
import UseState from "../../utils/types/UseState";
import patchCourse from "../../services/course/patchCourse";
import ICourseData from "../../utils/types/course/ICourseData";
import ErrorContext from "../../utils/ErrorContext";
import cloneDeep from "lodash.clonedeep";

interface InlineCourseCardProps {
  courseState: UseState<ICourseData>;
  checkboxState: UseState<boolean>;
  onRemove: () => void;
}

const schema = yup.string()   
  .max(254)
  .min(2)
  .required()
;

const InlineCourseCard: FC<InlineCourseCardProps> = ({ 
  courseState: [ course, setCourse ],
  checkboxState: [ checkbox, setCheckbox ],
  onRemove
}) => {
  const [ newName, setNewName ] = useState<string>(course.name);
  const setGlobalError = useContext(ErrorContext)[1];
  const [ editMode, setEditMode ] = useState(false);

  async function handleEditName () {
    try {
      await schema.validate(newName);
    } catch {
      return setGlobalError({ value: "Nome inválido" });
    }

    try {
      await patchCourse(course.id, newName);
    } catch {
      return setGlobalError({
        value: "Oops... Encontramos um erro inesperado, tente novamente mais tarde."
      });
    }

    const newCourse = cloneDeep(course);
    newCourse.name = newName;
    setCourse(newCourse);
  } 

  function handleToggleEditMode () {
    if (editMode) {
      setEditMode(false);
      handleEditName();
    } else {
      setNewName(course.name);
      setEditMode(true);
    }
  }

  return (
    <div className="inline-course">
      <div className="top-area">
        <input
          type="checkbox"
          name="course"
          checked={checkbox}
          onChange={() => setCheckbox(!checkbox)}
        />
        {
          editMode
          ? <input
              className="edit-input"
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyPress={e => {
                if (e.key === "Enter") {
                  handleToggleEditMode();
                }
              }}
            />
          : <p>{course.name}</p>
        }
      </div>

      <div className="button-area">
        <Icon className="edit" icon={editMode ? "feather:check" : "feather:edit"} onClick={handleToggleEditMode} />
        <Icon className="remove" icon="octicon:trash-24" onClick={onRemove}/>
      </div>
    </div>
  );
}

export default InlineCourseCard;