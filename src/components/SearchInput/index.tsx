import { FC, ChangeEvent, FocusEvent, KeyboardEvent, InputHTMLAttributes, useState, ReactNode } from 'react';
import UseState from '../../utils/types/UseState';

import './style.css';

export interface ISuggestion<T = any> extends ICurrentSuggestion {
  value: T;
}

export interface ICurrentSuggestion<T = any> {
  content: string;
  value?: T;
}

export interface ISearchInputProps<T = any> extends InputHTMLAttributes<HTMLInputElement> {
  suggestions: UseState<ISuggestion<T>[]>;
  current: UseState<ICurrentSuggestion<T>>;
  icon?: ReactNode;
  onSelection?: ((current: ICurrentSuggestion, suggestion: ISuggestion, event?: KeyboardEvent<HTMLInputElement>) => void);
  selected?: UseState<number | undefined>;
}

const SearchInput: FC<ISearchInputProps> = ({
  current: currentState,
  suggestions: suggestionsState,
  children,
  onChange,
  onFocus,
  onKeyDown,
  icon,
  onSelection,
  selected: selectedState,
  ...rest
}) => {
  let [ current, setCurrent ] = currentState;
  let [ suggestions ] = suggestionsState;
  let [ active, setActive ] = useState(false);
  let [ selected, setSelected ] = useState<number | undefined>();

  if (selectedState) {
    selected = selectedState[0];
    setSelected = selectedState[1] as any;
  }

  function handleChange (event: ChangeEvent<HTMLInputElement>) {
    if (!active) {
      setActive(true);
    }
    const newCurrent = { ...current };
    newCurrent.content = event.currentTarget.value;

    const potentialFind = suggestions.find(e => e.content === newCurrent.content);
    if (potentialFind) {
      newCurrent.value = potentialFind.value;
    }

    setCurrent(newCurrent);
    onChange && onChange(event);
  }

  function handleSelection (suggestion: ISuggestion) {
    setActive(false);
    setSelected(undefined);
    
    setCurrent(suggestion);
    onSelection && onSelection(current, suggestion);
  }

  function handleFocus (event: FocusEvent<HTMLInputElement>) {
    setActive(true);
    onFocus && onFocus(event)
  }

  function handleKeyDown (event: KeyboardEvent<HTMLInputElement>) {
    switch (event.keyCode) {
      //arrow up
      case 38:
        if (selected === undefined) {
          setActive(true);
          setSelected(suggestions.length - 1);
        } else if (selected <= 0) {
          setSelected(suggestions.length - 1);
        } else {
          setSelected(selected - 1);
        }
        break;
      //arrow down
      case 40:
        if (selected === undefined) {
          setActive(true);
          setSelected(0);
        } else if (selected >= suggestions.length - 1) {
          setSelected(0);
        } else {
          setSelected(selected + 1);
        }
        break;
      //enter
      case 13:
        event.preventDefault();
        if (selected !== undefined) {
          handleSelection(suggestions[selected]);
        }
        setActive(false);
        break;
    }
    onKeyDown && onKeyDown(event);
  }

  return (
    <div className={`search-input ${active && suggestions.length > 0 ? "active" : ""}`}>
      <div className="search-inner">
        <div className="input-container">
          <input
            type="text"
            value={current.content}
            onChange={handleChange}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            {...rest}
          />
          {icon}
        </div>
        <div className="suggestion-container">{active && suggestions.map((e, i) => (
          <div
            className={`suggestion ${i === selected ? "selected" : ""}`}
            onClick={event => {
              event.preventDefault();
              handleSelection(e);
            }}
            key={e.content}
          >
            {e.content}
          </div>
        ))}</div>
      </div>
      {children}
    </div>
  );
}

export default SearchInput;