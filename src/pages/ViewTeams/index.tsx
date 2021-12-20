import { AxiosError } from "axios";
import cloneDeep from "lodash.clonedeep";
import { useContext, useEffect, useRef, useState } from "react";
import Footer from "../../components/Footer";
import ModeratorFilter from "../../components/Modals/ModeratorFilter";
import ModeratorNavbar from "../../components/ModeratorNavbar";
import PageSelector from "../../components/PageSelector";
import SearchTeamsCard from "../../components/SeachTeamsCard";
import Searchbar from "../../components/Searchbar";
import teamCountGet from "../../services/team/getTeamCount";
import getTeam, { IGetTeamParams } from "../../services/team/getTeam";
import ErrorContext from "../../utils/ErrorContext";
import IAppError from "../../utils/types/API/IAppError";
import IListItemTeamWithId from "../../utils/types/team/IListItemTeamWithId";
import './style.css';

export default function ViewTeams() {
  const [ teams, setTeams ] = useState<IListItemTeamWithId[]>();
  const [ teamsCount, setTeamsCount ] = useState(0);
  const [ search, setSearch ] = useState("");
  const [ searchParams, setSearchParams ] = useState<IGetTeamParams>({
    page: 1
  });
  const [ open, setOpen ] = useState<boolean>(false);
  const setGlobalError = useContext(ErrorContext)[1];
  const mounted = useRef(false);

  function setPage (page: number) {
    const newSearchParams = cloneDeep(searchParams);
    newSearchParams.page = page;
    setSearchParams(newSearchParams);
  }

  function handleClear () {
    mounted.current && setSearchParams({
      page: searchParams.page,
    });
  }

  useEffect(() => {
    mounted.current = true;

    getTeam(searchParams).then(response => {
      mounted.current && setTeams(response.data);
    }).catch((error: AxiosError<IAppError>) => {
      if (error.response?.data.code === 1 && mounted.current) {
        setGlobalError({ value: "Oops... Algo de errado ocorreu." });
      }
      mounted.current && setTeams([]);
    });

    teamCountGet(searchParams).then(response => {
      mounted.current && setTeamsCount(response.data);
    }).catch(() => {});

    return () => { mounted.current = false; }
  }, [ searchParams ]);

  return (
    <div className="page view-teams-page">
      <ModeratorNavbar locale="teams" className="view-teams-navbar">
        <Searchbar 
          searchState={[ search, setSearch ]}
          onSearch={() => {
            const newParams = cloneDeep(searchParams);
            newParams.team = search === ""
              ? undefined
              : search
            ;
            setSearchParams(newParams);
          }}
          onClear={handleClear}
          onFilter={() => {setOpen(true)}}
        />
      </ModeratorNavbar>
      <div className="content">
        {
          teams?.length 
          ? teams?.map(e => (
              <SearchTeamsCard 
                id={e.id}
                course={e.course}
                name={e.name}
                logoURL={e.logoURL}
                theme={e.theme}
                key={e.id}
              />
            ))
          : <div className="not-found">Ops... Não achamos nenhuma equipe.</div>
        }
      </div>

      { 
        teams?.length 
        ? <PageSelector pageState={[ searchParams.page, setPage ]} listLength={teamsCount} />
        : null
      }

      <Footer />

      <ModeratorFilter
        searchParamsState={[searchParams, setSearchParams]}
        openState={[open, setOpen]}
      />
    </div>
  );
}