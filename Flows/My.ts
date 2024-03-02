import Constants from '../Helpers/Constants';
import CommonFlows from './CommonFlows'

class My {
  private static instance: My;

  // Singleton instance creation
  private constructor() { }

  // Get the singleton instance
  public static getInstance(): My {
    if (!My.instance) {
      My.instance = new My();
    }
    return My.instance;
  }

  // Properties
  public readonly CommonFlows = CommonFlows;
  public readonly Constants = Constants;
}

export default My.getInstance(); // Exporting the singleton instance
