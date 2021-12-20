import { FC, ReactElement } from "react";
import { Editor, EditorState } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import bold from './img/bold.svg';
import italic from './img/italic.svg';
import underline from './img/underline.svg';
import strikethrough from './img/strikethrough.svg';
import monospace from './img/monospace.svg';
import fontSize from './img/font-size.svg';
import indent from './img/indent.svg';
import outdent from './img/outdent.svg';
import ordered from './img/list-ordered.svg';
import unordered from './img/list-unordered.svg';
import left from './img/align-left.svg';
import center from './img/align-center.svg';
import right from './img/align-right.svg';
import justify from './img/align-justify.svg';
import color from './img/color.svg';
import eraser from './img/eraser.svg';
import link from './img/link.svg';
import unlink from './img/unlink.svg';
import emoji from './img/emoji.svg';
import image from './img/image.svg';
import undo from './img/undo.svg';
import redo from './img/redo.svg';
import subscript from './img/subscript.svg';
import superscript from './img/superscript.svg';
import "./style.css";

export interface IStyledEditorProps {
  editorState: EditorState;
  onChange: (value: EditorState) => void;
  toolbarCustomButtons?: ReactElement<HTMLElement, string | React.JSXElementConstructor<any>>[];
}

const StyledEditor: FC<IStyledEditorProps> = ({
  editorState,
  onChange,
  toolbarCustomButtons
}) => {
  return (
    <div className="styled-editor">
      <Editor 
        editorState={editorState}
        onEditorStateChange={onChange}
        localization={{
          locale: 'pt'
        }}
        editorClassName="editor"
        wrapperClassName="inner"
        toolbarClassName="toolbar"
        toolbarCustomButtons={toolbarCustomButtons}
        toolbar={{
          options: ['inline', 'blockType', 'fontSize', 'fontFamily', 'list', 'textAlign', 'colorPicker', 'link', 'emoji', 'image', 'remove', 'history'],
          inline: {
            inDropdown: false,
            className: undefined,
            component: undefined,
            dropdownClassName: undefined,
            options: ['bold', 'italic', 'underline', 'strikethrough', 'monospace', 'superscript', 'subscript'],
            bold: { icon: bold, className: undefined },
            italic: { icon: italic, className: undefined },
            underline: { icon: underline, className: undefined },
            strikethrough: { icon: strikethrough, className: undefined },
            monospace: { icon: monospace, className: undefined },
            superscript: { icon: superscript, className: undefined },
            subscript: { icon: subscript, className: undefined },
          },
          blockType: {
            inDropdown: true,
            options: ['Normal', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'Blockquote', 'Code'],
            className: undefined,
            component: undefined,
            dropdownClassName: undefined,
          },
          fontSize: {
            icon: fontSize,
            options: [8, 9, 10, 11, 12, 14, 16, 18, 24, 30, 36, 48, 60, 72, 96],
            className: undefined,
            component: undefined,
            dropdownClassName: undefined,
          },
          fontFamily: {
            options: ['Arial', 'Georgia', 'Impact', 'Tahoma', 'Times New Roman', 'Verdana'],
            className: undefined,
            component: undefined,
            dropdownClassName: undefined,
          },
          list: {
            inDropdown: false,
            className: undefined,
            component: undefined,
            dropdownClassName: undefined,
            options: ['unordered', 'ordered', 'indent', 'outdent'],
            unordered: { icon: unordered, className: undefined },
            ordered: { icon: ordered, className: undefined },
            indent: { icon: indent, className: undefined },
            outdent: { icon: outdent, className: undefined },
          },
          textAlign: {
            inDropdown: false,
            className: undefined,
            component: undefined,
            dropdownClassName: undefined,
            options: ['left', 'center', 'right', 'justify'],
            left: { icon: left, className: undefined },
            center: { icon: center, className: undefined },
            right: { icon: right, className: undefined },
            justify: { icon: justify, className: undefined },
          },
          colorPicker: {
            icon: color,
            className: undefined,
            component: undefined,
            popupClassName: undefined,
            colors: [
              'red',
              'crimson',
              'brown',
              'maroon',
              'fuchsia',
              'magenta',
              'hotpink',
              'plum',
              'purple',
              'navy',
              'blue', 
              'teal',
              'aqua',
              'cyan',
              'lime',
              'green',
              'olive',
              'seagreen',
              'yellow', 
              'khaki',
              'goldenrod',
              'orange',
              'coral',
              'white', 
              'black',
              'dimgrey',
              'gray',
              'silver',
              'azure',
              'ivory',
              'wheat',
            ],
          },
          link: {
            inDropdown: false,
            className: undefined,
            component: undefined,
            popupClassName: undefined,
            dropdownClassName: undefined,
            showOpenOptionOnHover: true,
            defaultTargetOption: '_self',
            options: ['link', 'unlink'],
            link: { icon: link, className: undefined },
            unlink: { icon: unlink, className: undefined },
            linkCallback: undefined
          },
          emoji: {
            icon: emoji,
            className: undefined,
            component: undefined,
            popupClassName: undefined,
            emojis: [
              '😀', '😁', '😂', '😃', '😉', '😋', '😎', '😍', '😗', '🤗', '🤔', '😣', '😫', '😴', '😌', '🤓',
              '😛', '😜', '😠', '😇', '😷', '😈', '👻', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '🙈',
              '🙉', '🙊', '👼', '👮', '🕵', '💂', '👳', '🎅', '👸', '👰', '👲', '🙍', '🙇', '🚶', '🏃', '💃',
              '⛷', '🏂', '🏌', '🏄', '🚣', '🏊', '⛹', '🏋', '🚴', '👫', '💪', '👈', '👉', '👉', '👆', '🖕',
              '👇', '🖖', '🤘', '🖐', '👌', '👍', '👎', '✊', '👊', '👏', '🙌', '🙏', '🐵', '🐶', '🐇', '🐥',
              '🐸', '🐌', '🐛', '🐜', '🐝', '🍉', '🍄', '🍔', '🍤', '🍨', '🍪', '🎂', '🍰', '🍾', '🍷', '🍸',
              '🍺', '🌍', '🚑', '⏰', '🌙', '🌝', '🌞', '⭐', '🌟', '🌠', '🌨', '🌩', '⛄', '🔥', '🎄', '🎈',
              '🎉', '🎊', '🎁', '🎗', '🏀', '🏈', '🎲', '🔇', '🔈', '📣', '🔔', '🎵', '🎷', '💰', '🖊', '📅',
              '✅', '❎', '💯',
            ],
          },
          image: {
            icon: image,
            className: undefined,
            component: undefined,
            popupClassName: undefined,
            urlEnabled: true,
            uploadEnabled: true,
            alignmentEnabled: true,
            uploadCallback: undefined,
            previewImage: false,
            inputAccept: 'image/gif,image/jpeg,image/jpg,image/png,image/svg',
            alt: { present: false, mandatory: false },
            defaultSize: {
              height: 'auto',
              width: 'auto',
            },
          },
          remove: { icon: eraser, className: undefined, component: undefined },
          history: {
            inDropdown: false,
            className: undefined,
            component: undefined,
            dropdownClassName: undefined,
            options: ['undo', 'redo'],
            undo: { icon: undo, className: undefined },
            redo: { icon: redo, className: undefined },
          },
        }}
      />
    </div>
  )
}

export default StyledEditor;