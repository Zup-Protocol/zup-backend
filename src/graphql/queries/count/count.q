query GetAllCounts {
  countIncrements {
    id
    number
    blockNumber
    blockTimestamp
  }
}

query GetLastIncrement {
  countIncrements(first: 1, orderBy: blockNumber, orderDirection: desc) {
    id
    number
    blockNumber
    blockTimestamp
  }
}
*/
