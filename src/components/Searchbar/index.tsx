import { useWindowWidth } from '@react-hook/window-size';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import UseState from '../../utils/types/UseState';
import { Icon } from '@iconify/react';

import './style.css';

interface props extends React.HTMLAttributes<HTMLDivElement> {
  searchState: UseState<string>;
  onSearch: () => Promise<void>|void;
  onClear?: () => Promise<void>|void;
  onFilter?: () => void;
}

const Searchbar: FC<props> = ({
  searchState,
  onSearch,
  onFilter,
  onClear
}) => {
  const [ extendedSearch, setExtendedSearch ] = useState<boolean>(false);
  const [ mobile, setMobile ] = useState(true);
  const [ search, setSearch ] = searchState;
  const screenSize = useWindowWidth();
  const mounted = useRef(false);
  
  useEffect(() => {
    mounted.current = true;

    mounted.current && setMobile(screenSize < 768);
    if (screenSize > 768 && mounted.current) {
      setExtendedSearch(false);
    } 

    return () => { mounted.current = false }
  }, [ screenSize ]);

  const handleMobileSearchBar = useCallback(() => {
    if (mounted.current) {
      if (!extendedSearch && mobile) {
        setExtendedSearch(true);
        return true;
      } else if (extendedSearch && (search.length === 0 || !searchState)) {
        setExtendedSearch(false);
        return true;
      }
    }
  }, [ extendedSearch, search, mobile ]);

  function handleClear () {
    setSearch("");
    onClear && onClear();
  }

  return (
    <div className="searchbar">
      <div className={`input-container ${extendedSearch && mobile ? "extended" : ""}`}>
        <div className="inner-container">
          <input
            className="searchbar-input"
            placeholder={mobile ? "" : "Pesquisar..."}
            onKeyPress={e => {
              if(e.key === 'Enter' && mounted.current){
                onSearch();
              }
            }}
            onChange={(e => {
              mounted.current && setSearch(e.target.value);
            })}
            value={search}
          />
          <button className="clear-search" onClick={handleClear}>
            <Icon icon="bx:bx-x" />
          </button>
        </div>
        <button 
          className="search-button" 
          onClick={() => {
            if (mounted.current) {
              if (mobile) {
                const action = handleMobileSearchBar();
                if (!action) {
                  onSearch();
                }
              } else {
                onSearch();
              }
            }
          }}
        >
          <Icon icon="cil:search" />
        </button>
      </div>
      {
        onFilter &&
        <button
          className="filter-button"
          onClick={onFilter}
        >
          <Icon icon="mono-icons:filter" className="filter-icon"/>
          {screenSize >= 768 && "Filtrar"}
        </button>
      }
    </div>
  );
}

export default Searchbar;