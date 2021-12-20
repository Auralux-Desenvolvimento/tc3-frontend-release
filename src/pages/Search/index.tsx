import { useContext, useEffect, useRef, useState } from "react";
import Navbar from "../../components/Navbar";
import TeamCard from "../../components/TeamCard";
import Footer from '../../components/Footer';
import { Link } from "react-router-dom";
import { InlineIcon } from '@iconify/react';
import filterIcon from '@iconify/icons-ci/filter';
import './style.css'
import FilterModal from "../../components/Modals/FilterModal";
import getSearch from "../../services/team/getSearch";
import LoadingPage from "../LoadingPage";
import PageSelector from "../../components/PageSelector";
import TeamSearchPageContext from "../../utils/TeamSearchPageContext";
import getCountTeams from "../../services/team/getCountTeams";
import TeamSearchContext from "../../utils/TeamSearchContext";
import IAppError from "../../utils/types/API/IAppError";
import ErrorContext from "../../utils/ErrorContext";
import { AxiosError } from "axios";
import InterestContext from "../../utils/InterestContext";
import UserDataContext from "../../utils/UserDataContext";
import IUserTeamData from "../../utils/types/team/IUserTeamData";

export default function Search() {
  const mounted = useRef(false);
  const [ open, setOpen ] = useState(false);
  const [ loading, setLoading ] = useState<boolean>(true);
  const [ countTeamsState, setCountTeamsState ] = useState<number>(0);
  const setGlobalError = useContext(ErrorContext)[1];
  const [ page, setPage ] = useContext(TeamSearchPageContext);
  const [ teams, setTeams ] = useContext(TeamSearchContext);
  const [ interest, setInterest ] = useContext(InterestContext);
  const team = useContext(UserDataContext)[0] as false | IUserTeamData | undefined;

  useEffect(() => {
    mounted.current = true;

    if (team && !team.isInAgreement) {
      getSearch(page).then(response => {
        mounted.current && setTeams(response.data);
      }).catch((error: AxiosError<IAppError>) => {
        if (mounted.current) {
          if (error.response?.data.code === 2) {
            mounted.current && setGlobalError({ value: "Você não pode procurar por outras equipes enquanto estiver em um acordo" });
          }
          mounted.current && setTeams([]);
        }
      });
  
      getCountTeams().then(response => {
        if (mounted.current) {
          setCountTeamsState(response.data);
          setLoading(false);
        }
      }).catch(() => {
        if (mounted.current) {
          setCountTeamsState(0);
          setLoading(false);
        }
      })
    } else {
      mounted.current && setGlobalError({ value: "Você não pode procurar por outras equipes enquanto estiver em um acordo" });
    }

    return () => { mounted.current = false; }
  }, [ page, team ]);

  async function handleSubmit() {
    try {
      const response = await getSearch(page);
      mounted.current && setTeams(response.data);
    } catch {
      mounted.current && setTeams([]);
    }
    mounted.current && setOpen(false)
  }

  return (<>
    <div className={`search-page page`}>
      <Navbar locale="teams"/>
      <div className="content">
        <div className="controls">
          <h1 className="content-title">Equipes</h1>
          {teams.length > 0 && <Link className="one-team-view" to="/equipe">Ver detalhadamente</Link>}
          <InlineIcon className="filter-icon" icon={filterIcon} onClick={() => setOpen(true)} />
        </div>
        {
          teams.length > 0
          ? <div className="teams">
              {
                loading 
                ? <LoadingPage/>
                : teams.map(e => (
                    <TeamCard
                      key={e.id}
                      team={e}
                      teamState={[ teams, setTeams ]}
                      interestState={[ interest, setInterest ]}
                    />
                  ))
              }
            </div>
          : <div className="not-found">
              Ops, não encontramos nenhuma equipe compatível com a sua...
            </div>
        }
        {loading || teams.length === 0
        ? null
        : <PageSelector listLength={countTeamsState} pageState={[ page, setPage ]} />}
      </div>
      {loading
        ? null
        :<Footer />}
      
    </div>
    <FilterModal 
      openState={[open, setOpen]} 
      handleSubmit={handleSubmit}
      buttonText="Filtrar"
    />
  </>);
}