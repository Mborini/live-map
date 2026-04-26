"use client";

import { useEffect, useState } from "react";
import {
  Table,
  Paper,
  Text,
  Badge,
  Loader,
  Group,
  Button,
  Tooltip,
  Modal,
  TextInput,
  Pagination,
} from "@mantine/core";
import { useSession } from "next-auth/react";
import {
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaSearch,
} from "react-icons/fa";
import { RiArrowGoForwardFill } from "react-icons/ri";

/* ================= TYPES ================= */

type Followup = {
  id: number;
  status_id: number;
  type_name: string;
  complaint_description: string;
  status_name: string;
  followup_description: string | null;
  updated_at: string | null;
};

/* =============== CONSTANTS =============== */

const PAGE_SIZE = 5;

const STATUS_OPTIONS = [
  {
    id: 1,
    label: "إرجاع إلى جديد",
    color: "green",
    icon: <RiArrowGoForwardFill size={14} />,
  },
  {
    id: 2,
    label: "قيد المعالجة",
    color: "orange",
    icon: <FaSpinner size={14} />,
  },
  {
    id: 3,
    label: "مغلقة",
    color: "blue",
    icon: <FaCheckCircle size={14} />,
  },
  {
    id: 4,
    label: "مرفوضة",
    color: "red",
    icon: <FaTimesCircle size={14} />,
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

  // ✅ Confirmation state (لكل الكبسات)
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    complaintId: number;
    status: number;
    label: string;
  } | null>(null);

  /* ============ SESSION / ROLES ============ */

  const { data: session } = useSession();
  const userRole = session?.user?.role;

  const CAN_UPDATE_STATUS =
    userRole === 1 || userRole === 2;

  /* =============== FETCH DATA ================ */

  useEffect(() => {
    fetch("/api/complaints/followups")
      .then((res) => res.json())
      .then((json) => (Array.isArray(json) ? setData(json) : []))
      .finally(() => setLoading(false));
  }, []);

  /* ================= SEARCH ================= */

  const filteredData = data.filter((row) =>
    [
      row.id.toString(),
      row.type_name,
      row.followup_description ?? "",
    ].some((field) =>
      field.toLowerCase().includes(search.toLowerCase())
    )
  );

  /* ================ PAGINATION ============== */

  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);

  const paginatedData = filteredData.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  /* ============== UPDATE STATUS ============= */

  const updateStatus = async (
    complaintId: number,
    status: number
  ) => {
    setProcessingId(complaintId);

    await fetch("/api/complaints/book-followup-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        complaintId,
        status,
        description:
          status === 1
            ? "إرجاع البلاغ إلى جديد"
            : "تغيير الحالة من المتابعة",
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
                    STATUS_OPTIONS.find((s) => s.id === status)
                      ?.label ?? r.status_name,
                }
              : r
          )
    );

    setProcessingId(null);
  };

  if (loading) return <Loader />;

  return (
    <Paper p="lg">
      <Text fw={700} size="lg" mb="md">
        متابعة البلاغات
      </Text>

      {/* 🔍 SEARCH */}
      <TextInput
        placeholder="بحث برقم البلاغ أو النوع أو الوصف"
        leftSection={<FaSearch size={16} />}
        value={search}
        onChange={(e) => {
          setSearch(e.currentTarget.value);
          setPage(1);
        }}
        mb="md"
      />

      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>#</Table.Th>
            <Table.Th>النوع</Table.Th>
            <Table.Th>الحالة</Table.Th>
            <Table.Th>وصف المتابعة</Table.Th>
            <Table.Th>آخر تحديث</Table.Th>
            <Table.Th>إجراءات</Table.Th>
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {paginatedData.map((row) => (
            <Table.Tr key={row.id}>
              <Table.Td>{row.id}</Table.Td>
              <Table.Td>{row.type_name}</Table.Td>

              <Table.Td>
                <Badge color={STATUS_COLOR_MAP[row.status_id]}>
                  {row.status_name}
                </Badge>
              </Table.Td>

              <Table.Td>{row.followup_description ?? "—"}</Table.Td>

              <Table.Td>
                {row.updated_at
                  ? new Date(row.updated_at).toLocaleString()
                  : "—"}
              </Table.Td>

              <Table.Td>
                {CAN_UPDATE_STATUS && (
                  <Group gap={8} wrap="nowrap">
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
                          style={{
                            width: 140,
                            justifyContent: "center",
                          }}
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

      {/* 📄 PAGINATION */}
      {totalPages > 1 && (
        <Pagination
          value={page}
          onChange={setPage}
          total={totalPages}
          mt="md"
         
        />
      )}

      {/* ✅ CONFIRM MODAL (لكل الكبسات) */}
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
          <Button
            variant="default"
            onClick={() => setConfirmOpen(false)}
          >
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
    </Paper>
  );
}