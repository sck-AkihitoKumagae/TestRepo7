'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { servers as serversApi } from '@/lib/api';
import { Server } from '@/lib/types';
import { 
  Search, 
  Filter, 
  Plus, 
  ChevronRight,
  Server as ServerIcon,
  Activity,
  Settings
} from 'lucide-react';

const fetcher = (url: string, params: any) => 
  serversApi.getAll(params).then(res => res.data);

export default function ServersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [envFilter, setEnvFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const perPage = 20;

  const { data, error, isLoading } = useSWR(
    ['/api/servers', { page, perPage, search: searchQuery, env: envFilter }],
    ([url, params]) => fetcher(url, params),
    { refreshInterval: 30000 }
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleEnvFilter = (env: string) => {
    setEnvFilter(env === envFilter ? '' : env);
    setPage(1);
  };

  const getEnvironmentBadge = (env: string) => {
    const badges = {
      prod: 'bg-red-100 text-red-800',
      stg: 'bg-yellow-100 text-yellow-800',
      dev: 'bg-blue-100 text-blue-800',
    };
    return badges[env as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ServerIcon className="w-8 h-8 text-gray-700" />
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  サーバー台帳
                </h1>
                <p className="text-sm text-gray-500">Server Inventory Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4" />
                <span>新規サーバー登録</span>
              </button>
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-full px-6 py-6">
        <div className="flex gap-6">
          {/* Left Sidebar - Filters */}
          <aside className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center space-x-2 mb-4">
                <Filter className="w-4 h-4 text-gray-600" />
                <h2 className="font-semibold text-gray-900">フィルタ</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    環境
                  </label>
                  <div className="space-y-2">
                    {['prod', 'stg', 'dev'].map((env) => (
                      <button
                        key={env}
                        onClick={() => handleEnvFilter(env)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          envFilter === env
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {env === 'prod' && '本番 (Production)'}
                        {env === 'stg' && '検証 (Staging)'}
                        {env === 'dev' && '開発 (Development)'}
                      </button>
                    ))}
                  </div>
                </div>

                {envFilter && (
                  <button
                    onClick={() => setEnvFilter('')}
                    className="w-full text-sm text-blue-600 hover:text-blue-700"
                  >
                    フィルタをクリア
                  </button>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-4 bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                統計情報
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">総サーバー数</span>
                  <span className="font-semibold text-gray-900">
                    {data?.total || 0}
                  </span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Search Bar */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="サーバー名、IP、タグで検索..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Server List */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        サーバー名
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        IPアドレス
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        環境
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        OS
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        ロール
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        ロケーション
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        状態
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        アクション
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {isLoading && (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                          読み込み中...
                        </td>
                      </tr>
                    )}
                    {error && (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center text-red-600">
                          エラーが発生しました。ログインしていることを確認してください。
                        </td>
                      </tr>
                    )}
                    {data?.servers?.map((server: Server) => (
                      <tr
                        key={server.id}
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => setSelectedServer(server)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {server.name}
                              </div>
                              {server.tags && server.tags.length > 0 && (
                                <div className="flex gap-1 mt-1">
                                  {server.tags.slice(0, 2).map((tag) => (
                                    <span
                                      key={tag.tag}
                                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                                    >
                                      {tag.tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-mono">
                            {server.ipAddress || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEnvironmentBadge(
                              server.environment
                            )}`}
                          >
                            {server.environment.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {server.os || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {server.role || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {server.location || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-green-600">
                            <Activity className="w-4 h-4 mr-1" />
                            稼働中
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button className="text-blue-600 hover:text-blue-800">
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {data && data.servers && data.servers.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                          サーバーが見つかりませんでした
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {data && data.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    {data.total}件中 {(page - 1) * perPage + 1} -{' '}
                    {Math.min(page * perPage, data.total)}件を表示
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      前へ
                    </button>
                    <button
                      onClick={() => setPage(Math.min(data.totalPages, page + 1))}
                      disabled={page === data.totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      次へ
                    </button>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Server Detail Drawer (Right Side) */}
      {selectedServer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setSelectedServer(null)}>
          <div
            className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-semibold text-gray-900">
                サーバー詳細
              </h2>
              <button
                onClick={() => setSelectedServer(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  基本情報
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      サーバー名
                    </label>
                    <div className="text-base text-gray-900">{selectedServer.name}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      IPアドレス
                    </label>
                    <div className="text-base text-gray-900 font-mono">
                      {selectedServer.ipAddress || '-'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      環境
                    </label>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEnvironmentBadge(
                        selectedServer.environment
                      )}`}
                    >
                      {selectedServer.environment.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      OS
                    </label>
                    <div className="text-base text-gray-900">
                      {selectedServer.os || '-'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      ロール
                    </label>
                    <div className="text-base text-gray-900">
                      {selectedServer.role || '-'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      ロケーション
                    </label>
                    <div className="text-base text-gray-900">
                      {selectedServer.location || '-'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {selectedServer.tags && selectedServer.tags.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    タグ
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {selectedServer.tags.map((tag) => (
                      <span
                        key={tag.tag}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        {tag.tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Attributes */}
              {selectedServer.attributes && Object.keys(selectedServer.attributes).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    追加情報
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(selectedServer.attributes).map(([key, value]) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          {key}
                        </label>
                        <div className="text-base text-gray-900">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  タイムスタンプ
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      作成日時
                    </label>
                    <div className="text-sm text-gray-900">
                      {new Date(selectedServer.createdAt).toLocaleString('ja-JP')}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      更新日時
                    </label>
                    <div className="text-sm text-gray-900">
                      {new Date(selectedServer.updatedAt).toLocaleString('ja-JP')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
