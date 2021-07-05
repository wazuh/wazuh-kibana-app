//@ts-ignore
import { getElasticAlerts } from '../../mitre/lib';

export async function getGitHubAlerts (indexPattern, filterParams, aggs) {
    try{
      if ( !indexPattern ) { return []; }
      const { data } = await getElasticAlerts(indexPattern, filterParams, aggs);
      const details = data.hits.hits.map( item => {
          return item._source.data.github
      })
      const filters = await buldFilters(details)
      return { alert_details: details, filters: filters}

    } catch(err){
      return []
    }
  };

  async function buldFilters(data) {

    const getCategoryActions = data.map(item => {
      return item.action.split('.')[0]
    })
    const getOrganizations = data.map(item => {
      return item.org
    })
    const categoryActions = Array.from(new Set(getCategoryActions));
    const organizations = Array.from(new Set(getOrganizations));

    const filters = { organizations: organizations, categories: categoryActions}

    return filters
  };
  