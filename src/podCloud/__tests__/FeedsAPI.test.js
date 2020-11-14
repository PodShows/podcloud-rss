/* eslint-env jest */

import FeedsAPI from "../FeedsAPI";

describe("FeedsAPI", () => {
  test("refuse to construct an object without a valid API endpoint", () => {
    expect(() => {
      new FeedsAPI("");
    }).toThrowError("An endpoint url is required");
  });

  test("construct an object with an API endpoint", () => {
    expect(new FeedsAPI("http://api.url")).toBeInstanceOf(FeedsAPI);
  });

  const feedsAPI = new FeedsAPI("http://feeds.podcloud.fr/");

  const mockClient = promiseFunc => ({
    query: jest.fn().mockReturnValue(new Promise(promiseFunc))
  });

  test("to resolve promise correctly", () => {
    const mockedClient = mockClient(resolve =>
      resolve({
        data: { podcast: { content: "content" } }
      })
    );
    expect(
      feedsAPI.getFeedWithIdentifier("toto", mockedClient)
    ).resolves.toEqual({ content: "content" });
  });

  test("to reject promise when data is incoherent", () => {
    const fakeData = { nodata: "incoherent" };
    const mockedClient = mockClient(resolve => resolve(fakeData));
    expect(
      feedsAPI.getFeedWithIdentifier("toto", mockedClient)
    ).rejects.toEqual(fakeData);
  });

  test("to reject promise correctly", () => {
    const mockedClient = mockClient((resolve, reject) => reject("error msg"));
    expect(
      feedsAPI.getFeedWithIdentifier("toto", mockedClient)
    ).rejects.toEqual("error msg");
  });
});
