import { Icon } from "@iconify/react";
import { convertFromRaw, EditorState, RawDraftContentState } from "draft-js";
import { FC, HTMLAttributes } from "react";
import { Editor } from "react-draft-wysiwyg";
import './style.css';

interface props extends HTMLAttributes<HTMLDivElement> {
  title: string;
  createdAt: string;
  content: RawDraftContentState;
  author?: string;
  onRemove?: () => void;
}

const PostCard: FC<props> = ({
  title,
  content,
  createdAt,
  onRemove,
  className,
  author,
  ...rest
}) => {
  const editorState = EditorState.createWithContent(convertFromRaw(content))
  return (
    <div className={`post-card-container ${className ? className : ""}`} {...rest} >
      <h1 className="title">{title}</h1>
      <p className="date">Data da postagem: {createdAt}</p>
      <Editor wrapperClassName="description" editorState={editorState as EditorState} toolbarHidden readOnly/>
      {
        onRemove
        ? <Icon className="remove" icon="octicon:trash-24" onClick={onRemove} />
        : <p className="author">Autor: {author}</p> 
      }
    </div>
  )
}

export default PostCard;