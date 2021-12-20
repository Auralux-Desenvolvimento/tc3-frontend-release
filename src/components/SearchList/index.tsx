import addFilled from "@iconify-icons/carbon/add-filled";
import { Icon } from "@iconify/react";
import cloneDeep from "lodash.clonedeep";
import { FC, useState, KeyboardEvent, useEffect, useRef, ReactNode } from "react";
import UseState from "../../utils/types/UseState";
import SearchInput, { ICurrentSuggestion, ISearchInputProps, ISuggestion } from "../SearchInput";
import Tag, { ITag } from "../Tag";

import './style.css';

export interface ISearchListProps extends Omit<Omit<ISearchInputProps, "icon">, "selected"> {
  items: UseState<ITag[]>;
  onError?: () => void;
  onSelection?: ((current: ICurrentSuggestion, suggestion?: ISuggestion, event?: KeyboardEvent<HTMLInputElement>) => void);
  strict?: boolean;
  error?: ReactNode;
}

const SearchList: FC<ISearchListProps> = ({
  current: currentState,
  items: itemsState,
  suggestions: suggestionsState,
  onSelection,
  onError,
  strict,
  error: errorDisplay,
  ...rest
}) => {
  const [ selected, setSelected ] = useState<number | undefined>();
  const [ items, setItems ] = itemsState;
  const [ suggestions, setSuggestions ] = suggestionsState;
  const [ current, setCurrent ] = currentState;
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;

    for (let item of items) {
      const suggestionIndex = suggestions.findIndex(e => e.content === item.label)
      if (suggestionIndex >= 0) {
        suggestions.splice(suggestionIndex, 1);
      }
    }

    return () => { mounted.current = false; }
  }, [ suggestions, items ]);

  function handleDeleteItem (index: number) {
    let newItems = cloneDeep(items);
    newItems.splice(index, 1);
    setItems(newItems);
  }

  function selectItem (
    current: ICurrentSuggestion,
    suggestion?: ISuggestion,
  ) {
    if (!current.content && !suggestion) {
      onError && onError();
      return;
    }

    let item: ICurrentSuggestion;
    let isItemNew;
    if (!suggestion) {
      const possibleSuggestion = suggestions.find(e => e.content === current.content);
      if (possibleSuggestion) {
        item = possibleSuggestion;
        isItemNew = false;
      } else if (strict) {
        onError && onError();
        return;
      } else {
        item = current;
        isItemNew = true;
      }
    } else {
      isItemNew = false;
      item = suggestion;
    }
    
    if (!isItemNew && items.find(e => item?.value?.id === e.id)) {
      return;
    }

    let newItems = cloneDeep(items);
    if (isItemNew) {
      newItems.push({
        label: item.content
      });
    } else {
      newItems.push(item.value);
    }
    setItems(newItems);
    setCurrent({ content: "" })

    onSelection && onSelection(current, suggestion);
  }

  return (
    <div className="search-list">
      {
        errorDisplay &&
        <div className="error">
          {errorDisplay}
        </div>
      }
      <SearchInput
        selected={[ selected, setSelected ]}
        current={[ current, setCurrent ]}
        suggestions={[ suggestions, setSuggestions ]}
        icon={
          <button
            className="button-add-preference"
            type="button"
            onClick={() => selectItem(current)}
          >
            <Icon icon={addFilled} width="30" height="30" color="var(--button-purple)" />
          </button>
        }
        onSelection={selectItem}
        {...rest}
      />
      <div className="tags">
        {items.map((e, i) => (
          <Tag
            className="tag-container"
            handleDelete={() => handleDeleteItem(i)}
            label={e.label}
            key={e.id}
          />
        ))}
      </div>
    </div>
  );
}

export default SearchList;