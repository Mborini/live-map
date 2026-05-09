"use client";

import { useEffect, useState } from "react";
import {
  Table,
  Card,
  Text,
  Badge,
  Loader,
  Group,
  Button,
  Tooltip,
  Modal,
  TextInput,
  Pagination,
  Container,
  Title,
} from "@mantine/core";
import { useSession } from "next-auth/react";
import {
  IconSearch,
  IconRefresh,
  IconClock,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import FollowupMapModal from "../components/Followup/FollowupMapModal";

/* ================= TYPES ================= */

type Followup = {
  id: number;
  status_id: number;
  type_name: string;
  sub_type_name?: string | null;
  complaint_description: string;
  status_name: string;
  followup_description: string | null;
  updated_at: string | null;

  // map props
  lat: number;
  lng: number;
  image_url?: string;
  shift_name?: string;
  zone_name?: string;
  username?: string;
  supervisor_name?: string;
  address?: string;
  created_at?: string;
};

/* =============== CONSTANTS =============== */

const PAGE_SIZE = 5;

const STATUS_OPTIONS = [
  {
    id: 1,
    label: "إرجاع إلى جديد",
    color: "green",
    icon: <IconRefresh size={14} />,
  },
  {
    id: 2,
    label: "قيد المعالجة",
    color: "orange",
    icon: <IconClock size={14} />,
  },
  {
    id: 3,
    label: "مغلقة",
    color: "blue",
    icon: <IconCheck size={14} />,
  },
  {
    id: 4,
    label: "مرفوضة",
    color: "red",
    icon: <IconX size={14} />,
  },
];

const STATUS_COLOR_MAP: Record<number, string> = {
  1: "green",
  2: "orange",
  3: "blue",
  4: "red",
};

/* ================= PAGE ================= */

export default function FollowupsPage() {
  const [data, setData] = useState<Followup[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    complaintId: number;
    status: number;
    label: string;
  } | null>(null);

  const [mapOpen, setMapOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<Followup | null>(null);

  /* ============ SESSION / ROLES ============ */
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const CAN_UPDATE_STATUS = userRole === 1 || userRole === 2;

  /* =============== FETCH DATA ================ */
  useEffect(() => {
    fetch("/api/complaints/followups")
      .then((res) => res.json())
      .then((json) => setData(Array.isArray(json) ? json : []))
      .finally(() => setLoading(false));
  }, []);

  /* ================= SEARCH ================= */
  const filteredData = data.filter((row) =>
    [row.id.toString(), row.type_name, row.followup_description ?? ""]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  /* ================ PAGINATION ============== */
  const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
  const paginatedData = filteredData.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  /* ============== UPDATE STATUS ============= */
  const updateStatus = async (complaintId: number, status: number) => {
    setProcessingId(complaintId);

    await fetch("/api/complaints/book-followup-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        complaintId,
        status,
        description:
          status === 1 ? "إرجاع البلاغ إلى جديد" : "تغيير الحالة من المتابعة",
      }),
    });

    setData((prev) =>
      status === 1
        ? prev.filter((r) => r.id !== complaintId)
        : prev.map((r) =>
            r.id === complaintId
              ? {
                  ...r,
                  status_id: status,
                  status_name:
                    STATUS_OPTIONS.find((s) => s.id === status)?.label ??
                    r.status_name,
                }
              : r
          )
    );

    setProcessingId(null);
  };

  if (loading) {
    return (
      <Group justify="center" mt="xl">
        <Loader />
      </Group>
    );
  }

  return (
    <Container size="xl">
      {/* HEADER */}
      <Group justify="space-between" mb="lg">
        <div>
          <Title order={2}>متابعة البلاغات</Title>
          <Text size="sm" c="dimmed">
            إدارة حالات المتابعة وتحديثها
          </Text>
        </div>
      </Group>

      {/* SEARCH */}
      <TextInput
        placeholder="بحث برقم البلاغ أو النوع أو الوصف"
        leftSection={<IconSearch size={16} />}
        value={search}
        onChange={(e) => {
          setSearch(e.currentTarget.value);
          setPage(1);
        }}
        mb="md"
      />

      {/* TABLE */}
      <Card withBorder shadow="sm">
        <Table.ScrollContainer minWidth={1000}>
          <Table highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th ta="center">#</Table.Th>
                <Table.Th ta="center">النوع</Table.Th>
                <Table.Th ta="center">الحالة</Table.Th>
                <Table.Th ta="center">وصف المتابعة</Table.Th>
                <Table.Th ta="center">آخر تحديث</Table.Th>
                <Table.Th ta="center">الموقع</Table.Th>
                <Table.Th ta="center">تغيير الحالة</Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {paginatedData.map((row) => (
                <Table.Tr key={row.id}>
                  <Table.Td ta="center">{row.id}</Table.Td>

                  <Table.Td ta="center">
                    {row.type_name} - {row.sub_type_name ?? "—"}
                  </Table.Td>

                  <Table.Td ta="center">
                    <Badge
                      variant="light"
                      color={STATUS_COLOR_MAP[row.status_id]}
                    >
                      {row.status_name}
                    </Badge>
                  </Table.Td>

                  <Table.Td ta="center">
                    {row.followup_description ?? "—"}
                  </Table.Td>

                  <Table.Td ta="center">
                    {row.updated_at
                      ? new Date(row.updated_at).toLocaleString()
                      : "—"}
                  </Table.Td>

                  <Table.Td ta="center">
                    <Button
                      size="xs"
                      variant="light"
                      onClick={() => {
                        setSelectedRow(row);
                        setMapOpen(true);
                      }}
                    >
                      عرض الموقع
                    </Button>
                  </Table.Td>

                  <Table.Td ta="center">
                    {CAN_UPDATE_STATUS && (
                      <Group justify="center" gap="sm">
                        {STATUS_OPTIONS.filter(
                          (s) => s.id !== row.status_id
                        ).map((s) => (
                          <Tooltip key={s.id} label={s.label}>
                            <Button
                              size="xs"
                              variant="light"
                              color={s.color}
                              leftSection={s.icon}
                              loading={processingId === row.id}
                              disabled={processingId !== null}
                              onClick={() => {
                                setPendingAction({
                                  complaintId: row.id,
                                  status: s.id,
                                  label: s.label,
                                });
                                setConfirmOpen(true);
                              }}
                            >
                              {s.label}
                            </Button>
                          </Tooltip>
                        ))}
                      </Group>
                    )}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Card>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <Pagination
          value={page}
          onChange={setPage}
          total={totalPages}
          mt="md"
          position="center"
        />
      )}

      {/* CONFIRM MODAL */}
      <Modal
        opened={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="تأكيد الإجراء"
        centered
      >
        <Text mb="md">
          هل أنت متأكد من تغيير حالة البلاغ إلى{" "}
          <b>{pendingAction?.label}</b>؟
        </Text>

        <Group justify="flex-end">
          <Button variant="default" onClick={() => setConfirmOpen(false)}>
            إلغاء
          </Button>
          <Button
            color="blue"
            onClick={() => {
              if (!pendingAction) return;
              updateStatus(
                pendingAction.complaintId,
                pendingAction.status
              );
              setConfirmOpen(false);
              setPendingAction(null);
            }}
          >
            تأكيد
          </Button>
        </Group>
      </Modal>

      {/* MAP MODAL */}
      {selectedRow && (
        <FollowupMapModal
          opened={mapOpen}
          onClose={() => setMapOpen(false)}
          lat={selectedRow.lat}
          lng={selectedRow.lng}
          imageUrl={selectedRow.image_url}
          description={selectedRow.complaint_description}
          shift={selectedRow.shift_name}
          zone={selectedRow.zone_name}
          user={selectedRow.username}
          supervisor={selectedRow.supervisor_name}
          address={selectedRow.address}
          created_at={selectedRow.created_at}
          id={selectedRow.id}
        />
      )}
    </Container>
  );
}