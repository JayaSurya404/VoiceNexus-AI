import type {
  KnowledgeCitationDto,
  KnowledgeDocumentDto,
  KnowledgeSearchDto,
} from "@/lib/api/ai-brain-api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function KnowledgeMonitorPanel({
  citations,
  documents,
  searches,
}: Readonly<{
  citations: KnowledgeCitationDto[];
  documents: KnowledgeDocumentDto[];
  searches: KnowledgeSearchDto[];
}>) {
  const totalChunks = documents.reduce((total, document) => total + document.chunkCount, 0);
  const averageConfidence = searches.length
    ? searches.reduce((total, search) => total + search.confidence, 0) / searches.length
    : 0;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        <Metric label="Knowledge documents" value={documents.length} />
        <Metric label="Chunk count" value={totalChunks} />
        <Metric label="Search activity" value={searches.length} />
        <Metric label="Retrieval confidence" value={`${Math.round(averageConfidence * 100)}%`} />
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Knowledge documents</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Chunks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.slice(0, 8).map((document) => (
                  <TableRow key={document.id}>
                    <TableCell>
                      <p className="font-medium">{document.title}</p>
                      <p className="text-xs text-muted-foreground">{document.sourceName}</p>
                    </TableCell>
                    <TableCell>{document.documentType}</TableCell>
                    <TableCell>
                      <Badge variant={document.status === "FAILED" ? "destructive" : document.status === "EMBEDDED" ? "default" : "outline"}>
                        {document.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{document.chunkCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {!documents.length ? <p className="text-sm text-muted-foreground">No knowledge documents uploaded yet.</p> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Search activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {searches.slice(0, 8).map((search) => (
              <div className="rounded-2xl border p-4" key={search.id}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{search.query}</p>
                  <Badge variant="outline">{Math.round(search.confidence * 100)}%</Badge>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {search.resultChunkIds.length} chunks / {new Date(search.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
            {!searches.length ? <p className="text-sm text-muted-foreground">Knowledge retrieval activity will appear here.</p> : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Citation viewer</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {citations.slice(0, 9).map((citation) => (
            <div className="rounded-2xl border p-4" key={citation.id}>
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">Citation {citation.id.slice(-8)}</p>
                <Badge>{Math.round(citation.relevanceScore * 100)}%</Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{citation.quote}</p>
              <p className="mt-3 text-xs text-muted-foreground">
                Doc {citation.documentId.slice(-8)} / chunk {citation.chunkId.slice(-8)}
              </p>
            </div>
          ))}
          {!citations.length ? <p className="text-sm text-muted-foreground">Generated answer citations will appear after RAG retrieval.</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ label, value }: Readonly<{ label: string; value: number | string }>) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
