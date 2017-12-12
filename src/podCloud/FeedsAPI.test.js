/* eslint-env jest */

import FeedsAPI from "./FeedsAPI"

describe("FeedsAPI", () => {
  test("refuse to construct an object without a valid API endpoint", () => {
    expect(() => {
      new FeedsAPI("")
    }).toThrowError("A remote endpoint is required for a network layer")
  })

  test("construct an object with an API endpoint", () => {
    expect(new FeedsAPI("http://api.url")).toBeInstanceOf(FeedsAPI)
  })

  const feedsAPI = new FeedsAPI("http://feeds.podcloud.fr/")

  test("to resolve promise correctly", () => {
    const mockedPromise = new Promise(function(resolve) {
      resolve({
        data: { podcastForFeedWithIdentifier: { content: "content" } }
      })
    })
    const mockedClient = { query: jest.fn().mockReturnValue(mockedPromise) }
    expect(
      feedsAPI.getFeedWithIdentifier("toto", mockedClient)
    ).resolves.toEqual({ content: "content" })
  })

  test("to reject promise when data is incoherent", () => {
    const fakeData = { nodata: "incoherent" }
    const mockedPromise = new Promise(function(resolve, reject) {
      resolve(fakeData)
    })
    const mockedClient = { query: jest.fn().mockReturnValue(mockedPromise) }
    expect(
      feedsAPI.getFeedWithIdentifier("toto", mockedClient)
    ).rejects.toEqual(fakeData)
  })

  test("to reject promise correctly", () => {
    const mockedPromise = new Promise(function(resolve, reject) {
      reject("error msg")
    })
    const mockedClient = { query: jest.fn().mockReturnValue(mockedPromise) }
    expect(
      feedsAPI.getFeedWithIdentifier("toto", mockedClient)
    ).rejects.toEqual("error msg")
  })
})
