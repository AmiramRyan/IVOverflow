import {
  createApi,
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { RootState } from '../../app/store';
import { logOut } from '../auth/authSlice';

export interface Question {
  _id: string;
  title: string;
  description: string;
  tags: string[];
  author: {
    _id: string;
    nickname?: string;
    fullName?: string;
  } | null;
  createdAt: string;
  updatedAt?: string;
  answers: Answer[];
}

export interface Answer {
  _id: string;
  content: string;
  author: { nickname?: string; fullName?: string; _id?: string } | string;
  createdAt: string;
  upvotes?: (string | { _id?: string })[];
  downvotes?: (string | { _id?: string })[];
}

export interface VoteState {
  answerId: string;
  upvotes: string[];
  downvotes: string[];
  upvotesCount: number;
  downvotesCount: number;
  netScore: number;
  userVote: 'up' | 'down' | null;
}

export interface VoteResponse {
  answerId: string;
  upvotes: string[];
  downvotes: string[];
  upvotesCount: number;
  downvotesCount: number;
  netScore: number;
}

const rawApiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const baseUrl = rawApiUrl.endsWith('/api')
  ? rawApiUrl
  : `${rawApiUrl.replace(/\/$/, '')}/api`;

const baseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);
  if (result.error && result.error.status === 401) {
    const url = typeof args === 'string' ? args : args.url;
    const isLoginRequest = url.includes('/login');
    if (!isLoginRequest) {
      api.dispatch(logOut());
    }
  }
  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Question', 'Votes'],
  endpoints: (builder) => ({
    login: builder.mutation<{ token: string }, { email: string; password: string }>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    getUserInfo: builder.query<
      { _id: string; id?: string; nickname: string; fullName: string; email: string },
      string | void
    >({
      query: (explicitToken) => ({
        url: '/auth/userInfo',
        headers: explicitToken
          ? { authorization: `Bearer ${explicitToken}` }
          : undefined,
      }),
    }),
    getQuestions: builder.query<Question[], void>({
      query: () => '/questions',
      providesTags: ['Question'],
    }),
    getQuestionById: builder.query<Question, string>({
      query: (id) => `/questions/${id}`,
      providesTags: (result, error, id) => [{ type: 'Question', id }],
    }),
    createQuestion: builder.mutation<
      Question,
      { title: string; description: string; tags: string[] }
    >({
      query: (newQuestion) => ({
        url: '/questions',
        method: 'POST',
        body: newQuestion,
      }),
      invalidatesTags: ['Question'],
    }),
    createAnswer: builder.mutation<Answer, { questionId: string; content: string }>({
      query: (answerBody) => ({
        url: '/interactions/answer',
        method: 'POST',
        body: answerBody,
      }),
      invalidatesTags: (result, error, { questionId }) => [
        { type: 'Question', id: questionId },
        'Question',
        'Votes',
      ],
    }),
    voteAnswer: builder.mutation<
      VoteResponse,
      { questionId: string; answerId: string; voteType: 'up' | 'down' }
    >({
      query: (voteBody) => ({
        url: '/interactions/vote',
        method: 'POST',
        body: voteBody,
      }),
      invalidatesTags: (result, error, { questionId }) => [
        { type: 'Question', id: questionId },
        'Question',
        'Votes',
      ],
    }),
    getVotes: builder.query<VoteState[], string>({
      query: (questionId) => `/interactions/votes/${questionId}`,
      providesTags: (result, error, questionId) => [
        { type: 'Votes', id: questionId },
      ],
    }),
  }),
});

export const {
  useLoginMutation,
  useLazyGetUserInfoQuery,
  useGetQuestionsQuery,
  useGetQuestionByIdQuery,
  useCreateQuestionMutation,
  useCreateAnswerMutation,
  useVoteAnswerMutation,
  useGetVotesQuery,
} = apiSlice;
